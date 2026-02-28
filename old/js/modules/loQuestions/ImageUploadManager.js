/**
 * ImageUploadManager - Handles image uploads for a single question
 *
 * Features:
 * - Drag-and-drop upload
 * - Click to upload
 * - File validation (size, type)
 * - Firebase Storage integration
 * - Offline support with base64
 * - Thumbnail management
 * - Full-size image modal
 */
class ImageUploadManager {
  constructor(questionId, config) {
    this.questionId = questionId;
    this.images = [];

    // Configuration
    this.maxImages = config.maxImages || 10;
    this.maxSize = config.maxSize || 5 * 1024 * 1024;  // 5MB
    this.firebaseService = config.firebaseService;
    this.onImageChange = config.onImageChange || (() => {});

    // Initialize
    this.setupEventHandlers();
  }

  /**
   * Set up drag-and-drop and click upload handlers
   */
  setupEventHandlers() {
    const uploadZone = document.getElementById(`upload-zone-${this.questionId}`);
    const fileInput = document.getElementById(`file-input-${this.questionId}`);
    const dropzone = uploadZone?.querySelector('.lo-upload-dropzone');

    if (!uploadZone || !fileInput || !dropzone) {
      console.warn(`[ImageUploadManager] Elements not found for ${this.questionId}`);
      return;
    }

    // Click to upload
    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handleFiles(files);
      fileInput.value = ''; // Reset for re-upload
    });

    // Drag over
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('drag-over');
    });

    // Drag leave
    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');
    });

    // Drop
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('drag-over');

      const files = Array.from(e.dataTransfer.files);
      this.handleFiles(files);
    });
  }

  /**
   * Handle multiple file uploads
   */
  async handleFiles(files) {
    for (const file of files) {
      await this.addImage(file);
    }
  }

  /**
   * Add a single image
   */
  async addImage(file) {
    // Validate image count
    if (this.images.length >= this.maxImages) {
      alert(`Maximum ${this.maxImages} images allowed per question`);
      return;
    }

    // Validate file
    const validation = this.validateFile(file);
    if (!validation.valid) {
      alert(`Upload failed:\n${validation.errors.join('\n')}`);
      return;
    }

    // Show uploading indicator
    console.log(`[ImageUploadManager] Uploading ${file.name}...`);

    // Upload to Firebase Storage or store offline
    const result = await this.uploadImage(file);

    if (result.success) {
      // Add to images array
      this.images.push({
        url: result.url,
        dataUrl: result.dataUrl,
        path: result.path,
        filename: result.filename,
        uploadedAt: new Date().toISOString(),
        size: result.size,
        order: this.images.length,
        needsSync: result.needsSync || false
      });

      // Re-render thumbnails
      this.renderThumbnails();

      // Notify parent module
      this.onImageChange();

      console.log(`[ImageUploadManager] ✓ Uploaded ${file.name}`);
    } else {
      alert(`Upload failed: ${result.error}`);
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file) {
    const errors = [];

    // Check file exists
    if (!file) {
      errors.push('No file provided');
    }

    // Check file size
    if (file.size > this.maxSize) {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const maxMB = (this.maxSize / 1024 / 1024).toFixed(0);
      errors.push(`File size (${sizeMB}MB) exceeds ${maxMB}MB limit`);
    }

    // Check file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif'];

    const isValidType = allowedTypes.includes(file.type);
    const isValidExtension = allowedExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isValidType && !isValidExtension) {
      errors.push('Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed.');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Upload image to Firebase Storage or store offline
   */
  async uploadImage(file) {
    const user = this.firebaseService?.getCurrentUser();

    // If offline or not authenticated, store as base64
    if (!user || !navigator.onLine) {
      console.log('[ImageUploadManager] Offline mode, storing as base64');
      return this.storeImageOffline(file);
    }

    try {
      // Initialize Firebase Storage
      const storage = firebase.storage();

      // Create file path
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `loQuestions/${user.uid}/${this.questionId}/images/${timestamp}_${sanitizedFilename}`;

      // Upload file
      const storageRef = storage.ref(filePath);
      const uploadTask = await storageRef.put(file);

      // Get download URL
      const downloadURL = await uploadTask.ref.getDownloadURL();

      return {
        success: true,
        url: downloadURL,
        path: filePath,
        filename: file.name,
        size: file.size,
        needsSync: false
      };
    } catch (error) {
      console.error('[ImageUploadManager] Firebase upload failed:', error);

      // Fallback to offline storage
      console.log('[ImageUploadManager] Falling back to offline storage');
      return this.storeImageOffline(file);
    }
  }

  /**
   * Store image offline as base64 data URL
   */
  async storeImageOffline(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve({
          success: true,
          dataUrl: e.target.result,
          filename: file.name,
          size: file.size,
          needsSync: true
        });
      };

      reader.onerror = () => {
        resolve({
          success: false,
          error: 'Failed to read file for offline storage'
        });
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Render thumbnails
   */
  renderThumbnails() {
    const container = document.getElementById(`thumbnails-${this.questionId}`);
    if (!container) return;

    // Clear existing thumbnails
    container.innerHTML = '';

    // Render each image
    this.images.forEach((image, index) => {
      const thumbnail = this.createThumbnailElement(image, index);
      container.appendChild(thumbnail);
    });
  }

  /**
   * Create thumbnail DOM element
   */
  createThumbnailElement(image, index) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'lo-thumbnail';
    thumbnail.dataset.index = index;

    // Image element
    const img = document.createElement('img');
    img.src = image.url || image.dataUrl;
    img.alt = image.filename;

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'lo-thumbnail-remove';
    removeBtn.innerHTML = '×';
    removeBtn.setAttribute('aria-label', `Remove ${image.filename}`);
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      this.removeImage(index);
    };

    // Assemble thumbnail
    thumbnail.appendChild(img);
    thumbnail.appendChild(removeBtn);

    // Click to view full size
    thumbnail.addEventListener('click', () => {
      this.showFullImage(image);
    });

    return thumbnail;
  }

  /**
   * Remove image
   */
  async removeImage(index) {
    const image = this.images[index];
    if (!image) return;

    const confirmDelete = confirm(`Remove "${image.filename}"?`);
    if (!confirmDelete) return;

    // Delete from Firebase Storage if it exists
    if (image.path) {
      try {
        const storage = firebase.storage();
        const storageRef = storage.ref(image.path);
        await storageRef.delete();
        console.log(`[ImageUploadManager] Deleted ${image.path} from Storage`);
      } catch (error) {
        console.error(`[ImageUploadManager] Error deleting from Storage:`, error);
        // Continue even if delete fails (may already be deleted)
      }
    }

    // Remove from array
    this.images.splice(index, 1);

    // Update order indices
    this.images.forEach((img, i) => {
      img.order = i;
    });

    // Re-render thumbnails
    this.renderThumbnails();

    // Notify parent
    this.onImageChange();
  }

  /**
   * Show full-size image in modal
   */
  showFullImage(image) {
    // Get or create modal
    let modal = document.getElementById('lo-image-modal');
    if (!modal) {
      modal = this.createImageModal();
    }

    // Set image source
    const img = document.getElementById('lo-image-modal-img');
    img.src = image.url || image.dataUrl;
    img.alt = image.filename;

    // Show modal
    modal.classList.add('active');

    // Set up close handlers
    const closeBtn = modal.querySelector('.lo-image-modal-close');
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.remove('active');
    }

    // Close on click outside image
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    };

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }

  /**
   * Get all images
   */
  getImages() {
    return this.images;
  }

  /**
   * Load images (called when loading saved data)
   */
  loadImages(images) {
    this.images = images || [];
    this.renderThumbnails();
  }
}

// Make available globally
window.ImageUploadManager = ImageUploadManager;

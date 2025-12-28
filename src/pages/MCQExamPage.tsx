import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMCQQuestions, getExamInfo } from '@/data/exams'
import type { MCQQuestion } from '@/types/exam'
import { useAuth } from '@/contexts/AuthContext'
import { loadExamProgress, saveExamProgress, type ExamProgress } from '@/services/firebase/firestore'

export default function MCQExamPage({ year }: { year: string }) {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const [questions, setQuestions] = useState<MCQQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number | null>>({})
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [examInfo, setExamInfo] = useState<ReturnType<typeof getExamInfo>>()
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [timerPaused, setTimerPaused] = useState(false)

  // Load exam data
  useEffect(() => {
    const loadData = async () => {
      if (examId) {
        const qs = getMCQQuestions(examId)
        const info = getExamInfo(examId)
        setQuestions(qs)
        setExamInfo(info)

        try {
          if (user) {
            // Load from Firestore for authenticated users
            const firestoreProgress = await loadExamProgress(user.uid, examId)
            if (firestoreProgress) {
              setCurrentIndex(firestoreProgress.currentIndex || 0)
              setAnswers(firestoreProgress.answers as Record<number, number | null> || {})
              setFlagged(new Set(firestoreProgress.flagged || []))
              setElapsedTime(firestoreProgress.elapsedTime || 0)
              // Sync to localStorage as backup
              localStorage.setItem(`exam-progress-${examId}`, JSON.stringify(firestoreProgress))
            } else {
              // Try localStorage and migrate
              const saved = localStorage.getItem(`exam-progress-${examId}`)
              if (saved) {
                const progress = JSON.parse(saved)
                setCurrentIndex(progress.currentIndex || 0)
                setAnswers(progress.answers || {})
                setFlagged(new Set(progress.flagged || []))
                setElapsedTime(progress.elapsedTime || 0)
                // Migrate to Firestore
                await saveExamProgress(user.uid, examId, progress)
              }
            }
          } else {
            // Load from localStorage for guests
            const saved = localStorage.getItem(`exam-progress-${examId}`)
            if (saved) {
              const progress = JSON.parse(saved)
              setCurrentIndex(progress.currentIndex || 0)
              setAnswers(progress.answers || {})
              setFlagged(new Set(progress.flagged || []))
              setElapsedTime(progress.elapsedTime || 0)
            }
          }
        } catch (error) {
          console.error('Error loading exam progress:', error)
          // Fallback to localStorage
          const saved = localStorage.getItem(`exam-progress-${examId}`)
          if (saved) {
            const progress = JSON.parse(saved)
            setCurrentIndex(progress.currentIndex || 0)
            setAnswers(progress.answers || {})
            setFlagged(new Set(progress.flagged || []))
            setElapsedTime(progress.elapsedTime || 0)
          }
        }
        setIsLoaded(true)
      }
    }
    loadData()
  }, [examId, user])

  // Timer
  useEffect(() => {
    if (timerPaused) return
    const interval = setInterval(() => {
      setElapsedTime(t => t + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [timerPaused])

  // Auto-save progress
  const saveProgress = useCallback(() => {
    if (examId && isLoaded) {
      const progressData: ExamProgress = {
        currentIndex,
        answers,
        flagged: Array.from(flagged),
        elapsedTime,
        lastUpdated: new Date().toISOString()
      }

      // Always save to localStorage immediately
      localStorage.setItem(`exam-progress-${examId}`, JSON.stringify(progressData))

      // Debounce Firestore saves
      if (user) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveExamProgress(user.uid, examId, progressData).catch(console.error)
        }, 2000) // Debounce by 2 seconds for exam progress
      }
    }
  }, [examId, currentIndex, answers, flagged, elapsedTime, user, isLoaded])

  useEffect(() => {
    saveProgress()
  }, [saveProgress])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const currentQuestion = questions[currentIndex]

  const handleSelectAnswer = (optionIndex: number) => {
    if (isReviewMode) return
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: prev[currentQuestion.id] === optionIndex ? null : optionIndex
    }))
  }

  const toggleFlag = () => {
    setFlagged(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id)
      } else {
        newSet.add(currentQuestion.id)
      }
      return newSet
    })
  }

  const goToQuestion = (index: number) => {
    setCurrentIndex(index)
  }

  const handleBack = () => {
    navigate(`/year${year}/exams`)
  }

  const calculateResults = () => {
    let correct = 0
    let incorrect = 0
    let unanswered = 0

    questions.forEach(q => {
      const answer = answers[q.id]
      if (answer === null || answer === undefined) {
        unanswered++
      } else if (q.correctAnswer !== undefined && answer === q.correctAnswer) {
        correct++
      } else {
        incorrect++
      }
    })

    return { correct, incorrect, unanswered, total: questions.length }
  }

  const handleSubmit = () => {
    const results = calculateResults()
    if (results.unanswered > 0) {
      if (!window.confirm(`You have ${results.unanswered} unanswered question${results.unanswered > 1 ? 's' : ''}. Are you sure you want to submit?`)) {
        return
      }
    }
    setShowResults(true)
    setTimerPaused(true)
  }

  const handleReviewAnswers = () => {
    setShowResults(false)
    setIsReviewMode(true)
    setCurrentIndex(0)
  }

  const handleReset = () => {
    if (!window.confirm('Are you sure you want to reset the exam? All your answers will be lost.')) {
      return
    }
    setAnswers({})
    setFlagged(new Set())
    setCurrentIndex(0)
    setElapsedTime(0)
    setIsReviewMode(false)
    setShowResults(false)
    setTimerPaused(false)
    if (examId) {
      localStorage.removeItem(`exam-progress-${examId}`)
      // Also clear from Firestore
      if (user) {
        const emptyProgress: ExamProgress = {
          currentIndex: 0,
          answers: {},
          flagged: [],
          elapsedTime: 0,
          lastUpdated: new Date().toISOString()
        }
        saveExamProgress(user.uid, examId, emptyProgress).catch(console.error)
      }
    }
  }

  if (!currentQuestion || !examInfo) {
    return (
      <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-[#4B535A] dark:text-gray-400">Loading exam...</div>
      </div>
    )
  }

  const results = calculateResults()
  const hasAnswers = examInfo.hasAnswers

  return (
    <div className="min-h-screen bg-[#F9F6F1] dark:bg-[#1a1a1a] flex">
      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-[90%] shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-[Georgia,'Times_New_Roman',serif] text-[#0A0A0A] dark:text-white mb-4">
                Exam Complete!
              </h2>
              {hasAnswers ? (
                <div className="text-5xl font-bold text-[#22C55E]">
                  {results.correct}/{results.total} ({Math.round(results.correct / results.total * 100)}%)
                </div>
              ) : (
                <p className="text-[#4B535A] dark:text-gray-400">
                  Answers are not yet available for this exam. Your responses have been saved.
                </p>
              )}
            </div>

            <div className="flex justify-around mb-8 p-5 bg-[#F9F6F1] dark:bg-gray-700 rounded-xl">
              {hasAnswers ? (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0A0A0A] dark:text-white">{results.correct}</div>
                    <div className="text-sm text-[#4B535A] dark:text-gray-400">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0A0A0A] dark:text-white">{results.incorrect}</div>
                    <div className="text-sm text-[#4B535A] dark:text-gray-400">Incorrect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0A0A0A] dark:text-white">{results.unanswered}</div>
                    <div className="text-sm text-[#4B535A] dark:text-gray-400">Unanswered</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0A0A0A] dark:text-white">{results.total - results.unanswered}</div>
                    <div className="text-sm text-[#4B535A] dark:text-gray-400">Answered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0A0A0A] dark:text-white">{results.unanswered}</div>
                    <div className="text-sm text-[#4B535A] dark:text-gray-400">Unanswered</div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3">
              {hasAnswers && (
                <button
                  onClick={handleReviewAnswers}
                  className="w-full py-3.5 bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#0A2540] transition-colors"
                >
                  Review Answers
                </button>
              )}
              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-white dark:bg-gray-700 border border-[#E8E3D9] dark:border-gray-600 text-[#0A0A0A] dark:text-white rounded-lg font-semibold hover:border-[#1e3a5f] transition-colors"
              >
                Reset & Try Again
              </button>
              <button
                onClick={handleBack}
                className="w-full py-3.5 bg-white dark:bg-gray-700 border border-[#E8E3D9] dark:border-gray-600 text-[#0A0A0A] dark:text-white rounded-lg font-semibold hover:border-[#1e3a5f] transition-colors"
              >
                Back to Exams
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 h-[72px] bg-white dark:bg-gray-800 border-b border-[#E8E3D9] dark:border-gray-700 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0A0A0A] dark:text-white bg-white dark:bg-gray-700 border border-[#E8E3D9] dark:border-gray-600 rounded-lg hover:border-[#D97757] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-lg font-medium text-[#0A0A0A] dark:text-white font-[Georgia,'Times_New_Roman',serif]">
            {examInfo.title}
          </h1>
        </div>
        <div className="font-[Georgia,'Times_New_Roman',serif] text-lg text-[#0A0A0A] dark:text-white">
          {formatTime(elapsedTime)}
        </div>
      </div>

      {/* Question Navigation Sidebar */}
      <div className="fixed left-0 top-[72px] bottom-0 w-[100px] bg-white dark:bg-gray-800 border-r border-[#E8E3D9] dark:border-gray-700 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {questions.map((q, idx) => {
            const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined
            const isFlagged = flagged.has(q.id)
            const isActive = idx === currentIndex
            const isCorrect = isReviewMode && hasAnswers && answers[q.id] === q.correctAnswer
            const isIncorrect = isReviewMode && hasAnswers && answers[q.id] !== undefined && answers[q.id] !== q.correctAnswer

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all mx-auto
                  ${isActive
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/10 text-[#0A0A0A] dark:text-white'
                    : isReviewMode && isCorrect
                      ? 'border-[#22C55E] bg-[#22C55E] text-white'
                      : isReviewMode && isIncorrect
                        ? 'border-[#EF4444] bg-[#EF4444] text-white'
                        : isAnswered
                          ? 'border-[#1e3a5f] bg-[#1e3a5f] text-white'
                          : 'border-[#E8E3D9] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#0A0A0A] dark:text-white hover:border-[#1e3a5f]'
                  }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -top-1.5 -right-1.5 text-base">🚩</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-[100px] pt-[72px] flex-1 flex flex-col">
        {/* Review Mode Banner */}
        {isReviewMode && (
          <div className="bg-transparent border-b border-[#E8E3D9] dark:border-gray-700 px-8 py-2 text-sm text-[#4B535A] dark:text-gray-400">
            Review Mode
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-[Georgia,'Times_New_Roman',serif] text-[#0A0A0A] dark:text-white">
                Question {currentIndex + 1}
              </h2>
              {!isReviewMode && (
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    flagged.has(currentQuestion.id)
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-white dark:bg-gray-700 border-[#E8E3D9] dark:border-gray-600 text-[#0A0A0A] dark:text-white hover:border-red-400'
                  }`}
                >
                  {flagged.has(currentQuestion.id) ? 'Flagged' : 'Flag Question'}
                </button>
              )}
            </div>

            {/* Question Text */}
            <div className="p-6 bg-white dark:bg-gray-800 border border-[#E8E3D9] dark:border-gray-700 rounded-xl mb-6">
              <p className="text-base leading-relaxed text-[#0A0A0A] dark:text-white">
                {currentQuestion.text}
              </p>
            </div>

            {/* MCQ Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === idx
                const isCorrectAnswer = currentQuestion.correctAnswer === idx
                const showCorrect = isReviewMode && hasAnswers && isCorrectAnswer
                const showIncorrect = isReviewMode && hasAnswers && isSelected && !isCorrectAnswer

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={isReviewMode}
                    className={`w-full p-4 pr-28 text-left border-2 rounded-xl transition-all relative
                      ${showCorrect
                        ? 'border-[#22C55E] bg-[#22C55E]/20 font-semibold'
                        : showIncorrect
                          ? 'border-[#EF4444] bg-[#EF4444]/10'
                          : isSelected
                            ? 'border-[#1e3a5f] bg-[#1e3a5f]/10'
                            : 'border-[#E8E3D9] dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5'
                      }
                      ${isReviewMode ? 'cursor-default' : 'cursor-pointer'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#0A0A0A] dark:text-white min-w-[24px]">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-[#0A0A0A] dark:text-white">{option}</span>
                    </div>

                    {/* Your answer / Correct / Incorrect labels */}
                    {isReviewMode && hasAnswers && isSelected && (
                      <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${
                        isCorrectAnswer ? 'text-[#22C55E]' : 'text-[#EF4444]'
                      }`}>
                        {isCorrectAnswer ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-[#E8E3D9] dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-[#E8E3D9] dark:border-gray-600 rounded-lg text-sm font-medium text-[#0A0A0A] dark:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#D97757] transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
              className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0A2540] transition-colors"
            >
              Next →
            </button>
          </div>
          {isReviewMode ? (
            <button
              onClick={handleBack}
              className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#0A2540] transition-colors"
            >
              Finish Review
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-[#1e3a5f] text-white rounded-lg text-sm font-medium hover:bg-[#0A2540] transition-colors"
            >
              Submit & Review Answers
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

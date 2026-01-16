import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { useToast } from '../../hooks/useToast.js'
import { learnerService } from '../../services/api.js'
import { CheckCircle, XCircle, HelpCircle, Award } from 'lucide-react'

export const McqQuiz = ({ lectureId, lectureName, onComplete }) => {
  const [mcqs, setMcqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchMcqs = async () => {
      try {
        setLoading(true)
        const data = await learnerService.getLectureMcqs(lectureId)
        setMcqs(Array.isArray(data) ? data : [])
      } catch (err) {
        // No MCQs is not an error - just means no quiz for this lecture
        if (err.message?.includes('No MCQs found')) {
          setMcqs([])
        } else {
          console.error('Failed to load MCQs:', err)
        }
      } finally {
        setLoading(false)
      }
    }
    if (lectureId) {
      fetchMcqs()
    }
  }, [lectureId])

  const handleSelectAnswer = (mcqId, answer) => {
    if (submitted) return
    setSelectedAnswers(prev => ({
      ...prev,
      [mcqId]: answer
    }))
  }

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length < mcqs.length) {
      showToast({
        type: 'error',
        title: 'Incomplete',
        message: 'Please answer all questions before submitting'
      })
      return
    }
    setSubmitted(true)
    setShowResults(true)
  }

  const calculateScore = () => {
    let correct = 0
    mcqs.forEach(mcq => {
      if (selectedAnswers[mcq._id]?.toLowerCase() === mcq.correctAns?.toLowerCase()) {
        correct++
      }
    })
    return { correct, total: mcqs.length, percentage: Math.round((correct / mcqs.length) * 100) }
  }

  const handleRetake = () => {
    setSelectedAnswers({})
    setSubmitted(false)
    setShowResults(false)
    setCurrentIndex(0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-slate-500">Loading quiz...</div>
      </div>
    )
  }

  if (mcqs.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
        <HelpCircle className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-3 text-slate-600">No quiz available for this lecture.</p>
      </div>
    )
  }

  const currentMcq = mcqs[currentIndex]
  const score = showResults ? calculateScore() : null

  if (showResults && score) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-center">
          <Award className={`mx-auto h-16 w-16 ${score.percentage >= 70 ? 'text-emerald-500' : 'text-amber-500'}`} />
          <h3 className="mt-4 text-2xl font-bold text-slate-900">Quiz Complete!</h3>
          <p className="mt-2 text-slate-600">{lectureName}</p>
          <div className="mt-6 rounded-xl bg-slate-50 p-6">
            <p className="text-4xl font-bold text-slate-900">{score.percentage}%</p>
            <p className="mt-1 text-slate-600">
              {score.correct} out of {score.total} correct
            </p>
          </div>
          {score.percentage >= 70 ? (
            <p className="mt-4 text-emerald-600 font-medium">Great job! You passed the quiz.</p>
          ) : (
            <p className="mt-4 text-amber-600 font-medium">Keep learning! You need 70% to pass.</p>
          )}
        </div>

        {/* Review Answers */}
        <div className="mt-8 space-y-4">
          <h4 className="font-semibold text-slate-900">Review Your Answers</h4>
          {mcqs.map((mcq, idx) => {
            const isCorrect = selectedAnswers[mcq._id]?.toLowerCase() === mcq.correctAns?.toLowerCase()
            return (
              <div key={mcq._id} className={`rounded-lg border p-4 ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 text-red-600 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Q{idx + 1}: {mcq.question}</p>
                    <p className="mt-1 text-sm">
                      <span className="text-slate-600">Your answer: </span>
                      <span className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>{selectedAnswers[mcq._id]}</span>
                    </p>
                    {!isCorrect && (
                      <p className="mt-1 text-sm">
                        <span className="text-slate-600">Correct answer: </span>
                        <span className="text-emerald-700">{mcq.correctAns}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex gap-3 justify-center">
          <Button variant="outline" onClick={handleRetake}>
            Retake Quiz
          </Button>
          {onComplete && (
            <Button onClick={() => onComplete(score)}>
              Continue
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Question {currentIndex + 1} of {mcqs.length}</span>
          <span>{Object.keys(selectedAnswers).length} answered</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
          <div 
            className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / mcqs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{currentMcq.question}</h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {currentMcq.options.map((option, idx) => {
          const isSelected = selectedAnswers[currentMcq._id] === option
          return (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(currentMcq._id, option)}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 text-slate-600'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1">{option}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {mcqs.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-3 w-3 rounded-full transition-all ${
                idx === currentIndex
                  ? 'bg-indigo-600'
                  : selectedAnswers[mcqs[idx]._id]
                  ? 'bg-indigo-300'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {currentIndex === mcqs.length - 1 ? (
          <Button onClick={handleSubmit}>
            Submit Quiz
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentIndex(prev => Math.min(mcqs.length - 1, prev + 1))}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

McqQuiz.propTypes = {
  lectureId: PropTypes.string.isRequired,
  lectureName: PropTypes.string,
  onComplete: PropTypes.func,
}

McqQuiz.defaultProps = {
  lectureName: 'Quiz',
  onComplete: null,
}

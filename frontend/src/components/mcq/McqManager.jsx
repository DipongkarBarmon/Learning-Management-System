import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button } from '../ui/button.jsx'
import { Input } from '../ui/input.jsx'
import { Label } from '../ui/label.jsx'
import { Modal } from '../ui/modal.jsx'
import { useToast } from '../../hooks/useToast.js'
import { instructorService } from '../../services/api.js'
import { Plus, Trash2, CheckCircle, HelpCircle, Edit2 } from 'lucide-react'

export const McqManager = ({ lectureId, lectureName, isOpen, onClose }) => {
  const [mcqs, setMcqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const { showToast } = useToast()

  // Form state
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [correctAns, setCorrectAns] = useState('')
  
  // Edit state
  const [editingMcq, setEditingMcq] = useState(null)

  useEffect(() => {
    const fetchMcqs = async () => {
      if (!lectureId || !isOpen) return
      try {
        setLoading(true)
        const data = await instructorService.getLectureMcqs(lectureId)
        setMcqs(Array.isArray(data) ? data : [])
      } catch (err) {
        // No MCQs found is not an error
        if (err.message?.includes('No MCQs found')) {
          setMcqs([])
        } else {
          console.error('Failed to load MCQs:', err)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchMcqs()
  }, [lectureId, isOpen])

  const resetForm = () => {
    setQuestion('')
    setOptions(['', '', '', ''])
    setCorrectAns('')
    setShowAddForm(false)
    setEditingMcq(null)
  }

  const startEditing = (mcq) => {
    setEditingMcq(mcq)
    setQuestion(mcq.question)
    // Ensure we have at least 4 options for editing
    const mcqOptions = [...mcq.options]
    while (mcqOptions.length < 4) {
      mcqOptions.push('')
    }
    setOptions(mcqOptions)
    setCorrectAns(mcq.correctAns)
    setShowAddForm(true)
  }

  const handleDelete = async (mcqId) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    setDeleting(mcqId)
    try {
      await instructorService.deleteMcq(mcqId)
      setMcqs(prev => prev.filter(m => m._id !== mcqId))
      showToast({ type: 'success', title: 'MCQ deleted', message: 'Question deleted successfully' })
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to delete', message: err.message })
    } finally {
      setDeleting(null)
    }
  }

  const handleOptionChange = (index, value) => {
    setOptions(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions(prev => [...prev, ''])
    }
  }

  const handleRemoveOption = (index) => {
    if (options.length > 3) {
      setOptions(prev => prev.filter((_, i) => i !== index))
      // Clear correct answer if it was the removed option
      if (correctAns === options[index]) {
        setCorrectAns('')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    const filledOptions = options.filter(o => o.trim() !== '')
    if (filledOptions.length < 3) {
      showToast({ type: 'error', title: 'Invalid options', message: 'Please provide at least 3 options' })
      return
    }
    if (!correctAns) {
      showToast({ type: 'error', title: 'No correct answer', message: 'Please select the correct answer' })
      return
    }
    if (!filledOptions.includes(correctAns)) {
      showToast({ type: 'error', title: 'Invalid correct answer', message: 'Correct answer must be one of the options' })
      return
    }

    setSaving(true)
    try {
      if (editingMcq) {
        // Update existing MCQ
        const payload = {
          question: question.trim(),
          options: filledOptions,
          correctAns: correctAns.trim()
        }
        const updatedMcq = await instructorService.updateMcq(editingMcq._id, payload)
        setMcqs(prev => prev.map(m => m._id === editingMcq._id ? updatedMcq : m))
        showToast({ type: 'success', title: 'MCQ updated', message: 'Question updated successfully' })
      } else {
        // Create new MCQ
        const payload = {
          lectureId,
          question: question.trim(),
          options: filledOptions,
          correctAns: correctAns.trim()
        }
        const newMcq = await instructorService.createMcq(payload)
        setMcqs(prev => [...prev, newMcq])
        showToast({ type: 'success', title: 'MCQ created', message: 'Question added successfully' })
      }
      resetForm()
    } catch (err) {
      showToast({ type: 'error', title: editingMcq ? 'Failed to update MCQ' : 'Failed to create MCQ', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={`Quiz Manager - ${lectureName || 'Lecture'}`}
      footer={null}
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading MCQs...</div>
        ) : (
          <>
            {/* Existing MCQs */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">
                  Questions ({mcqs.length})
                </h4>
                {!showAddForm && (
                  <Button size="sm" onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Question
                  </Button>
                )}
              </div>

              {mcqs.length === 0 && !showAddForm ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                  <HelpCircle className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-3 text-slate-600">No questions yet.</p>
                  <p className="text-sm text-slate-500">Add quiz questions for this lecture.</p>
                  <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mcqs.map((mcq, idx) => (
                    <div key={mcq._id} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            <span className="text-indigo-600">Q{idx + 1}:</span> {mcq.question}
                          </p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {mcq.options.map((opt, optIdx) => (
                              <div
                                key={optIdx}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                                  opt.toLowerCase() === mcq.correctAns?.toLowerCase()
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : 'bg-slate-50 text-slate-700'
                                }`}
                              >
                                {opt.toLowerCase() === mcq.correctAns?.toLowerCase() && (
                                  <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                )}
                                <span className="font-medium mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(mcq)}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Edit question"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(mcq._id)}
                            disabled={deleting === mcq._id}
                            className="text-slate-400 hover:text-red-600"
                            title="Delete question"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add/Edit MCQ Form */}
            {showAddForm && (
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-semibold text-slate-900 mb-4">
                  {editingMcq ? 'Edit Question' : 'Add New Question'}
                </h4>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Enter your question"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Options (select correct answer)</Label>
                    <div className="space-y-2">
                      {options.map((option, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => option.trim() && setCorrectAns(option)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-all ${
                              correctAns === option && option.trim()
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-slate-300 text-slate-600 hover:border-slate-400'
                            }`}
                            title="Mark as correct answer"
                          >
                            {correctAns === option && option.trim() ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              String.fromCharCode(65 + idx)
                            )}
                          </button>
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            className="flex-1"
                          />
                          {options.length > 3 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(idx)}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {options.length < 6 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleAddOption}
                        className="mt-2"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add Option
                      </Button>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Click the letter button to mark the correct answer (highlighted in green).
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="ghost" onClick={resetForm} disabled={saving}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : editingMcq ? 'Update Question' : 'Add Question'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}

McqManager.propTypes = {
  lectureId: PropTypes.string.isRequired,
  lectureName: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

McqManager.defaultProps = {
  lectureName: 'Lecture',
}

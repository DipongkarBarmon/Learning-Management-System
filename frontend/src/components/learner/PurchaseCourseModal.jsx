import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Modal } from '../ui/modal.jsx'
import { Input } from '../ui/input.jsx'
import { Label } from '../ui/label.jsx'
import { Button } from '../ui/button.jsx'
import { learnerService } from '../../services/api.js'
import { useToast } from '../../hooks/useToast.js'
import { currency } from '../../utils/formatters.js'

export const PurchaseCourseModal = ({ course, open, onClose, onSuccess }) => {
  const [provider, setProvider] = useState('')
  const [account, setAccount] = useState('')
  const [secret, setSecret] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (!open) {
      setProvider('')
      setAccount('')
      setSecret('')
      setSubmitting(false)
    }
  }, [open])

  const handlePurchase = async (event) => {
    event.preventDefault()
    if (!course?._id && !course?.courseId) return
    try {
      setSubmitting(true)
      await learnerService.enroll({
        courseId: course._id || course.courseId,
        provider,
        accountNumber: account,
        secretKey: secret,
      })
      showToast({
        type: 'success',
        title: 'Purchase successful',
        message: 'You now have access to this course.',
      })
      onClose()
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Payment failed',
        message: err.message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={`Buy "${course?.title || 'course'}"`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button form="purchase-course-form" type="submit" disabled={submitting}>
            {submitting ? 'Processing...' : 'Confirm payment'}
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
        <p className="font-semibold">
          {currency(course?.price)} ·{' '}
          {course?.instructor?.name || course?.instructor?.fullName || course?.instructor?.username || 'Instructor'}
        </p>
        <p className="text-indigo-700/80">
          Enter your registered bank details to complete this purchase instantly.
        </p>
      </div>
      <form id="purchase-course-form" className="space-y-4" onSubmit={handlePurchase}>
        <div className="space-y-2">
          <Label htmlFor="bank-provider">Bank provider</Label>
          <Input
            id="bank-provider"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            placeholder="e.g. Chase, Bank of America"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank-account">Bank account number</Label>
          <Input
            id="bank-account"
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            placeholder="Enter your bank account number"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secret-key">Secret key</Label>
          <Input
            id="secret-key"
            type="password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            placeholder="Enter your secret key"
            required
          />
        </div>
      </form>
    </Modal>
  )
}

PurchaseCourseModal.propTypes = {
  course: PropTypes.object,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
}

PurchaseCourseModal.defaultProps = {
  course: null,
  onSuccess: null,
}



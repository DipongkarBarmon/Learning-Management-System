import { useState } from 'react'
import PropTypes from 'prop-types'
import { Modal } from '../ui/modal.jsx'
import { Input } from '../ui/input.jsx'
import { Label } from '../ui/label.jsx'
import { Button } from '../ui/button.jsx'
import { useToast } from '../../hooks/useToast.js'

export const AddBalanceModal = ({ isOpen, onClose, onSuccess, addBalanceFunc }) => {
  const [balance, setBalance] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addBalanceFunc({
        balance: Number(balance),
        accountNumber,
        secretKey,
      })
      showToast({ type: 'success', title: 'Balance added', message: 'Your balance has been updated successfully' })
      setBalance('')
      setAccountNumber('')
      setSecretKey('')
      onClose()
      if (onSuccess) onSuccess()
    } catch (err) {
      showToast({ type: 'error', title: 'Failed to add balance', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      open={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Add Balance"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button form="add-balance-form" type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Add Balance'}
          </Button>
        </>
      }
    >
      <form id="add-balance-form" className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="balance">Amount to Add ($)</Label>
          <Input
            id="balance"
            type="number"
            min="0"
            step="0.01"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="100.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="account-number">Account Number</Label>
          <Input
            id="account-number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Enter your account number"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secret">Secret Key</Label>
          <Input
            id="secret"
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter your secret key"
            required
          />
        </div>
      </form>
    </Modal>
  )
}

AddBalanceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  addBalanceFunc: PropTypes.func.isRequired,
}

AddBalanceModal.defaultProps = {
  onSuccess: null,
}

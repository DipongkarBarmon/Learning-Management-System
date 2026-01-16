import { useState } from 'react'
import { learnerService } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export const BankSetupModal = ({ isOpen, onClose }) => {
    const [provider, setProvider] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [accountHolderName, setAccountHolderName] = useState('')
    const [balance, setBalance] = useState(0)
    const [secret, setSecret] = useState('')
    const [loading, setLoading] = useState(false)
    const { updateUser } = useAuth()
    const { showToast } = useToast()

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const responseUser = await learnerService.updateBankInfo({
                provider,
                accountNumber,
                accountHolderName,
                balance: Number(balance),
                secretKey: secret,
            })
            updateUser({ bankAccountCreated: true, accountNumber: responseUser?.accountNumber })
            showToast({ type: 'success', message: 'Bank info updated successfully' })
            // Clear form
            setProvider('')
            setAccountNumber('')
            setAccountHolderName('')
            setBalance(0)
            setSecret('')
            onClose()
        } catch (err) {
            showToast({ type: 'error', message: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-slate-900">Setup Bank Information</h2>
                <p className="mb-6 text-sm text-slate-600">
                    To purchase courses, you need to link your bank account.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Bank Provider
                        </label>
                        <input
                            type="text"
                            required
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. Chase, Bank of America"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Account Holder Name
                        </label>
                        <input
                            type="text"
                            required
                            value={accountHolderName}
                            onChange={(e) => setAccountHolderName(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Your full name"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Account Number
                        </label>
                        <input
                            type="text"
                            required
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="e.g. 1234567890"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Initial Balance
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={balance}
                            onChange={(e) => setBalance(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Secret Key
                        </label>
                        <input
                            type="password"
                            required
                            value={secret}
                            onChange={(e) => setSecret(e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Your bank secret"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save & Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

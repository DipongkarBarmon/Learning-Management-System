import { useState } from 'react'
import PropTypes from 'prop-types'
import { Modal } from '../ui/modal.jsx'
import { Input } from '../ui/input.jsx'
import { Label } from '../ui/label.jsx'
import { Button } from '../ui/button.jsx'
import { useToast } from '../../hooks/useToast.js'
import { useAuth } from '../../hooks/useAuth.js'
import { userService } from '../../services/api.js'

export const UpdateProfileModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState('account') // 'account', 'password', 'avatar'
  
  // Account details state
  const [fullname, setFullname] = useState(user?.fullname || user?.fullName || '')
  const [email, setEmail] = useState(user?.email || '')
  
  // Password state
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null)
  
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdateAccount = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await userService.updateAccount({ fullname, email })
      updateUser({ fullname, email, ...result })
      showToast({ type: 'success', title: 'Profile updated', message: 'Your account details have been updated successfully' })
      if (onSuccess) onSuccess()
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', title: 'Password mismatch', message: 'New password and confirm password do not match' })
      return
    }
    setLoading(true)
    try {
      await userService.updatePassword({ oldPassword, newPassword })
      showToast({ type: 'success', title: 'Password updated', message: 'Your password has been changed successfully' })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      if (onSuccess) onSuccess()
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAvatar = async (e) => {
    e.preventDefault()
    if (!avatarFile) {
      showToast({ type: 'error', title: 'No file selected', message: 'Please select an image to upload' })
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      const result = await userService.updateAvatar(formData)
      updateUser({ avatar: result?.avatar || avatarPreview })
      showToast({ type: 'success', title: 'Avatar updated', message: 'Your profile picture has been updated successfully' })
      setAvatarFile(null)
      if (onSuccess) onSuccess()
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed', message: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'password', label: 'Password' },
    { id: 'avatar', label: 'Profile Picture' },
  ]

  return (
    <Modal
      open={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Update Profile"
      footer={null}
    >
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Details Tab */}
      {activeTab === 'account' && (
        <form onSubmit={handleUpdateAccount} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input
              id="fullname"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Account'}
            </Button>
          </div>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oldPassword">Current Password</Label>
            <Input
              id="oldPassword"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your current password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </Button>
          </div>
        </form>
      )}

      {/* Avatar Tab */}
      {activeTab === 'avatar' && (
        <form onSubmit={handleUpdateAvatar} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full object-cover border-4 border-slate-200"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  No Image
                </div>
              )}
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="avatar">Select New Profile Picture</Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-slate-500">
                Recommended: Square image, at least 200x200 pixels
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !avatarFile}>
              {loading ? 'Uploading...' : 'Update Picture'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}

UpdateProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
}

UpdateProfileModal.defaultProps = {
  onSuccess: null,
}

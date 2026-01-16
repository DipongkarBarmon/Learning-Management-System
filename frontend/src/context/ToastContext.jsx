import PropTypes from 'prop-types'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './toast-context.js'

const colors = {
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  error: 'bg-orange-100 text-orange-800 border-orange-200',
  info: 'bg-slate-100 text-slate-700 border-slate-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((payload) => {
    idRef.current += 1
    const toast = {
      id: idRef.current,
      message: payload.message,
      title: payload.title,
      type: payload.type || 'info',
      duration: payload.duration || 4000,
    }
    setToasts((current) => [...current, toast])
    if (toast.duration > 0) {
      setTimeout(() => removeToast(toast.id), toast.duration)
    }
  }, [removeToast])

  const value = useMemo(
    () => ({
      showToast,
      removeToast,
    }),
    [showToast, removeToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[999] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg transition ${colors[toast.type] || colors.info}`}
          >
            {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
            <p className="text-sm">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
}



import { cva } from 'class-variance-authority'
import PropTypes from 'prop-types'
import { cn } from '../../utils/cn.js'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-cyan-700 text-white hover:bg-cyan-800 shadow-lg shadow-cyan-200',
        outline:
          'border border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-50',
        ghost: 'text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50/60',
        soft: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
      },
      size: {
        default: 'px-5 py-2.5',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3 text-base',
        icon: 'h-9 w-9 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export const Button = ({ className, variant, size, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
)

Button.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outline', 'ghost', 'soft']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon']),
}

Button.defaultProps = {
  className: '',
  variant: 'default',
  size: 'default',
}



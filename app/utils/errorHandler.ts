import toast from 'react-hot-toast';
import { StatusError } from '../types/error';

export function handleLoginError(error: unknown) {
  let message = 'Login failed';

  if (error instanceof StatusError) {
    message = error.message;

    switch (message) {
      case "Email doesn't exist":
        toast.error("Email doesn't exist. Please register first.");
        return;
      case 'Password is incorrect':
        toast.error('Password is incorrect. Please try again.');
        return;
      default:
        toast.error(message);
        return;
    }
  }

  if (error instanceof Error) {
    toast.error(error.message || message);
    return;
  }

  toast.error(message);
}

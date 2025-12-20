
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, RefreshCw, Send } from 'lucide-react';
import api from "../services/api";
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

const VerifyEmailPage = () => {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [hasSentCode, setHasSentCode] = useState(false);
    const [email, setEmail] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const { checkAuth, user, isLoading: isAuthLoading } = useAuthStore();

    const isJustVerified = useRef(false);

    useEffect(() => {
        if (isAuthLoading) return;

        // Redirect if already verified
        if (user?.is_verified) {
            if (!isJustVerified.current) {
                toast.success("You are already verified", { id: 'already-verified' });
                isJustVerified.current = true;
            }
            navigate('/');
            return;
        }

        // Get email from router state or local storage/auth store if available
        if (location.state?.email) {
            setEmail(location.state.email);
        } else if (user?.email) {
            setEmail(user.email);
        } else {
            // If no email found and not logged in, redirect to login
            if (!user) {
                toast.error("No email provided for verification", { id: 'no-email-error' });
                navigate('/login');
            }
        }
    }, [location, navigate, user, isAuthLoading]);

    if (isAuthLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP", { id: 'otp-length-error' });
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otp });
            toast.success("Email verified successfully!", { id: 'verify-success' });

            isJustVerified.current = true;

            // Update auth state (if user was already logged in or auto-login)
            await checkAuth();

            navigate('/');
        } catch (error) {
            console.error("Verification failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendCode = async () => {
        setIsSending(true);
        try {
            await api.post('/auth/resend-otp', { email });
            toast.success("Verification code sent to your email.", { id: 'otp-sent' });
            setHasSentCode(true);
        } catch (error) {
            console.error("Send failed", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Mail size={24} />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Verify your email
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {hasSentCode
                        ? <>We've sent a 6-digit code to <span className="font-medium text-gray-900 dark:text-gray-200">{email}</span></>
                        : <>Click below to send a verification code to <span className="font-medium text-gray-900 dark:text-gray-200">{email}</span></>
                    }
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-700">
                    {!hasSentCode ? (
                        <div className="space-y-6">
                            <button
                                onClick={handleSendCode}
                                disabled={isSending}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                            >
                                {isSending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        Sending Code...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} className="mr-2" />
                                        Send Verification Code
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <>
                            <form className="space-y-6" onSubmit={handleVerify}>
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Enter verification code
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            maxLength="6"
                                            required
                                            className="appearance-none block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white text-center tracking-widest text-lg font-mono"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify Email'
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                                            Didn't receive the code?
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={handleSendCode}
                                        disabled={isSending}
                                        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                    >
                                        {isSending ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-current mr-2"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw size={16} className="mr-2" />
                                                Resend OTP
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {!user && (
                    <div className="mt-6 text-center">
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 text-sm">
                            &larr; Back to login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;

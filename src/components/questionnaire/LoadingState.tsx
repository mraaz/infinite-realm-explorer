
interface LoadingStateProps {
  isAuthenticated: boolean;
  isCompleting: boolean;
}

const LoadingState = ({ isAuthenticated, isCompleting }: LoadingStateProps) => {
  return (
    <div className="w-full max-w-5xl text-center">
      <h1 className="text-3xl font-bold text-gray-800 my-8">
        {isAuthenticated ? 'Completing your survey...' : 'Calculating your results...'}
      </h1>
      <p className="text-lg text-gray-600">Please wait a moment.</p>
      {isCompleting && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default LoadingState;

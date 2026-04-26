import CodingPractice from './CodingPractice';
import PreviewPage from './PreviewPage';

export default function CodingPage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return (
      <PreviewPage
        title="Coding Practice"
        description="See the coding practice tools available, then log in to begin exercises and challenges."
      />
    );
  }

  return <CodingPractice />;
}

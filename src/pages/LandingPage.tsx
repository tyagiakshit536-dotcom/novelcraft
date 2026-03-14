import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Validate origin to ensure it's from our app
      if (e.origin !== window.location.origin) return;
      
      if (e.data === 'navigate-login') {
        navigate('/auth');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-50">
      <TopNav />
      {/* Add padding-top to iframe container so TopNav doesn't overlap text */}
      <div className="w-full h-full pt-16">
        <iframe 
          src="/landing-content.html" 
          className="w-full h-full border-none outline-none block"
          title="NovelCraft Landing Page"
        />
      </div>
    </div>
  );
}

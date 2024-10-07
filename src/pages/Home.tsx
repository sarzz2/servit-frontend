import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { openModal } from '../slices/authModalSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../Store';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const controls = useAnimation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="min-h-screen">
      <section className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome to Servit
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Experience the future of communication
          </p>
          <button
            className="px-8 py-3 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-blue-100 transition-colors"
            onClick={() => {
              if (user) {
                navigate('/home');
              } else {
                dispatch(openModal('signup'));
              }
            }}
          >
            Get Started
          </button>
        </motion.div>
      </section>

      <section
        ref={ref}
        className="py-20"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div className="container mx-auto px-4">
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate={controls}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            style={{ color: 'var(--text-primary)' }}
          >
            Our Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Real-time Chat', 'Voice Calls', 'File Sharing'].map(
              (feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  initial="hidden"
                  animate={controls}
                  transition={{ delay: index * 0.2 }}
                  className="p-6 rounded-lg shadow-md"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                >
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {feature}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                </motion.div>
              )
            )}
          </div>
        </div>
      </section>

      <section
        className="py-20"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-8"
              style={{ color: 'var(--text-primary)' }}
            >
              Ready to get started?
            </h2>
            <p
              className="text-xl mb-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              Join thousands of users already enjoying our app
            </p>
            <button
              className="px-8 py-3 bg-accent-color text-white rounded-full text-lg font-semibold hover:bg-opacity-90 transition-colors"
              onClick={() => {
                if (user) {
                  navigate('/home');
                } else {
                  dispatch(openModal('signup'));
                }
              }}
            >
              {user ? 'Open Servit' : 'Sign Up Now'}
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

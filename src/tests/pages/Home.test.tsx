import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/Home';
import { openModal } from '../../slices/authModalSlice';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../slices/authModalSlice', () => ({
  openModal: jest.fn(),
}));

jest.mock('react-intersection-observer', () => ({
  useInView: jest.fn(),
}));

const mockStore = configureStore([]);

describe('HomePage Component', () => {
  let store: ReturnType<typeof mockStore>;
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    store = mockStore({
      user: { user: null },
    });

    (useInView as jest.Mock).mockReturnValue([jest.fn(), true]);
  });

  test('renders welcome message', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Welcome to Servit')).toBeInTheDocument();
    expect(
      screen.getByText('Experience the future of communication')
    ).toBeInTheDocument();
  });

  test('redirects to home if user is logged in', () => {
    store = mockStore({
      user: { user: { name: 'Test User' } },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText('Get Started'));
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  test('opens signup modal if user is not logged in', () => {
    const dispatch = jest.fn();
    store.dispatch = dispatch;

    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText('Get Started'));
    expect(dispatch).toHaveBeenCalledWith(openModal('signup'));
  });

  test('render signup button and modal if user not logged in', () => {
    const dispatch = jest.fn();
    store.dispatch = dispatch;
    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Sign Up Now')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Sign Up Now'));
    expect(dispatch).toHaveBeenCalledWith(openModal('signup'));
  });

  test('render Open Servit and naviagate to home page', () => {
    store = mockStore({
      user: { user: { name: 'Test User' } },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      </Provider>
    );

    fireEvent.click(screen.getByText('Open Servit'));
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });
});

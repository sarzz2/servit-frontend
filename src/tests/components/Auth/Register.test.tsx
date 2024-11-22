import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Register from '../../../components/Auth/Register';
import { useSnackbar } from '../../../components/Snackbar';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../utils/axiosInstance';
import MockAdapter from 'axios-mock-adapter';
import { setUser } from '../../../slices/userSlice';
import { openModal } from '../../../slices/authModalSlice';

const mockStore = configureStore([]);

jest.mock('../../../components/Snackbar', () => ({
  useSnackbar: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('Register Component', () => {
  let store: ReturnType<typeof mockStore>;
  let mockNavigate: jest.Mock;
  let mockShowSnackbar: jest.Mock;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    store = mockStore({
      authModal: { isOpen: true, type: 'signup' },
    });

    mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    mockShowSnackbar = jest.fn();
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });

    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
  });

  test('renders registration form', () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const passwordFields = screen.getAllByLabelText(/password/i);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(passwordFields[0]).toBeInTheDocument();
    expect(passwordFields[1]).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test('successful registration submits form and redirects', async () => {
    mockAxios.onPost('/users/register').reply(200, {
      access_token: 'fake_token',
      email: 'test@example.com',
      username: 'testuser',
      id: '123',
      profile_picture_url: 'http://example.com/profile.jpg',
    });

    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.input(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(passwordFields[0], {
      target: { value: 'password123' },
    });

    fireEvent.input(screen.getByLabelText(/confirm/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Registration successful!',
        'success'
      );
      expect(store.getActions()).toContainEqual(
        setUser({
          email: 'test@example.com',
          username: 'testuser',
          id: '123',
          profilePicture: 'http://example.com/profile.jpg',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('/home');
      expect(localStorage.getItem('access_token')).toBe('fake_token'); // Check that the token is stored
    });
  });

  test('shows error message on invalid registration', async () => {
    mockAxios
      .onPost('/users/register')
      .reply(400, { detail: 'Email already exists.' });

    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.input(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(passwordFields[0], {
      target: { value: 'password123' },
    });

    fireEvent.input(screen.getByLabelText(/confirm/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Email already exists.',
        'error'
      );
    });
  });

  test('shows error message on other errors', async () => {
    mockAxios.onPost('/users/register').reply(500, {
      detail: 'An error occurred. Please try again.',
    });
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.input(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(passwordFields[0], {
      target: { value: 'password123' },
    });

    fireEvent.input(screen.getByLabelText(/confirm/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'An error occurred. Please try again.',
        'error'
      );
    });
  });

  test('displays validation error messages', async () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(
      await screen.findByText(/username is required/i)
    ).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password is required/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/confirm password is required/i)
    ).toBeInTheDocument();
  });

  test('displays validation error messages for password confirmation', async () => {
    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );
    const passwordFields = screen.getAllByLabelText(/password/i);

    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.input(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.input(passwordFields[0], {
      target: { value: 'password123' },
    });

    fireEvent.input(screen.getByLabelText(/confirm/i), {
      target: { value: 'differentpassword' }, // Different from password
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(
      await screen.findByText(/Passwords must match/i)
    ).toBeInTheDocument();
  });

  test('redirect to login modal', () => {
    const dispatch = jest.fn();
    store.dispatch = dispatch;

    render(
      <Provider store={store}>
        <Register />
      </Provider>
    );

    fireEvent.click(screen.getByText('Login here'));
    expect(dispatch).toHaveBeenCalledWith(openModal('login'));
  });
});

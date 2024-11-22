import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Login from '../../../components/Auth/Login';
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

describe('Login Component', () => {
  let store: ReturnType<typeof mockStore>;
  let mockNavigate: jest.Mock;
  let mockShowSnackbar: jest.Mock;
  let mockAxios: MockAdapter;

  beforeEach(() => {
    store = mockStore({
      authModal: { isOpen: true, type: 'login' },
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

  test('renders login form', () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    expect(screen.getByText(/username/i)).toBeInTheDocument();
    expect(screen.getByText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('successful login submits form and redirects', async () => {
    const fakeToken = 'fake_token';
    mockAxios.onPost('/users/login').reply(200, {
      access_token: fakeToken,
      email: 'test@example.com',
      username: 'testuser',
      id: '123',
      profile_picture_url: 'http://example.com/profile.jpg',
    });
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.input(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Login successful!',
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
      expect(setItemSpy).toHaveBeenCalledWith('access_token', fakeToken);
      setItemSpy.mockRestore();
    });
  });

  test('shows error message on invalid login', async () => {
    mockAxios.onPost('/users/login').reply(401);

    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: 'wronguser' },
    });
    fireEvent.input(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Invalid username or password.',
        'error'
      );
    });
  });

  test('shows error message on other errors', async () => {
    mockAxios.onPost('/users/login').reply(500);

    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.input(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

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
        <Login />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('displays validation error messages for password length', async () => {
    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    fireEvent.input(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.input(screen.getByLabelText(/password/i), {
      target: { value: 'passw' },
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  test('redirect to signup modal', () => {
    const dispatch = jest.fn();
    store.dispatch = dispatch;

    render(
      <Provider store={store}>
        <Login />
      </Provider>
    );

    fireEvent.click(screen.getByText('Sign up now'));
    expect(dispatch).toHaveBeenCalledWith(openModal('signup'));
  });
});

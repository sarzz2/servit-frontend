import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AuthPopup from '../../../components/Auth/AuthPopup';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from '../../../components/Snackbar';
import { closeModal } from '../../../slices/authModalSlice';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../../../components/Snackbar', () => ({
  useSnackbar: jest.fn(),
}));

const mockStore = configureStore([]);
const dispatch = jest.fn();

describe('AuthPopup Component', () => {
  let store: ReturnType<typeof mockStore>;
  let mockNavigate: jest.Mock;
  let mockShowSnackbar: jest.Mock;

  beforeEach(() => {
    mockNavigate = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    mockShowSnackbar = jest.fn();
    (useSnackbar as jest.Mock).mockReturnValue({
      showSnackbar: mockShowSnackbar,
    });

    store = mockStore({
      authModal: {
        isOpen: true,
        type: 'login',
      },
    });

    store.dispatch = dispatch;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders login component when type is login', () => {
    render(
      <Provider store={store}>
        <AuthPopup />
      </Provider>
    );

    expect(screen.getByText(/username/i)).toBeInTheDocument();
    expect(screen.getByText(/password/i)).toBeInTheDocument();
  });

  test('renders register component when type is register', () => {
    store = mockStore({
      authModal: {
        isOpen: true,
        type: 'register',
      },
    });
    store.dispatch = dispatch;

    render(
      <Provider store={store}>
        <AuthPopup />
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

  test('does not render when isOpen is false', () => {
    store = mockStore({
      authModal: {
        isOpen: false,
        type: 'login',
      },
    });

    render(
      <Provider store={store}>
        <AuthPopup />
      </Provider>
    );

    expect(screen.queryByText(/username/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/password/i)).not.toBeInTheDocument();
  });

  test('dispatches closeModal action when close button is clicked', () => {
    render(
      <Provider store={store}>
        <AuthPopup />
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: '' }));
    expect(dispatch).toHaveBeenCalledWith(closeModal());
  });

  test('dispatches closeModal action when Escape key is pressed', () => {
    render(
      <Provider store={store}>
        <AuthPopup />
      </Provider>
    );

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(dispatch).toHaveBeenCalledWith(closeModal());
  });
});

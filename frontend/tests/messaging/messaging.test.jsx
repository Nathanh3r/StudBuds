import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MessagesPage from '../../src/app/messages/page';
import { GamificationProvider } from '../../src/app/context/GamificationContext';
import { useAuth } from '../../src/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import React from 'react';

const customRender = (ui) =>
  render(<GamificationProvider>{ui}</GamificationProvider>);

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => "/messages"),
  useSearchParams: jest.fn(() => ({
    get: (key) => {
      if (key === "userId") return "abc123";
      return null;
    },
  })),
}));

jest.mock('../../src/app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'me123', name: 'Myself' },
    token: 'test-token',
    loading: false,
  }),
}));

jest.mock('../../src/app/context/SidebarContext', () => ({
  useSidebar: () => ({
    isCollapsed: false,
  }),
}));

jest.mock('../../src/app/context/DarkModeContext', () => ({
  useDarkMode: () => ({
    darkMode: false,
  }),
}));

const mockRefetch = jest.fn();

jest.mock('../../src/app/hooks/useConversations', () => ({
  useConversations: () => ({
    conversations: [
      {
        user: { _id: 'user1', name: 'Alice', major: 'CS' },
        lastMessage: { content: 'Hello!', createdAt: '2024-01-01T00:00:00Z' },
        unreadCount: 1,
      },
    ],
    loading: false,
    backendError: null,
    refetch: mockRefetch,
  }),
}));

const mockFetchMessages = jest.fn();
const mockSendMessage = jest.fn();
const mockMarkAsRead = jest.fn();
const mockFetchUserById = jest.fn();

jest.mock('../../src/app/lib/api/messages', () => ({
  fetchMessages: (...args) => mockFetchMessages(...args),
  sendMessage: (...args) => mockSendMessage(...args),
  markMessagesAsRead: (...args) => mockMarkAsRead(...args),
}));

jest.mock('../../src/app/lib/api/friends', () => ({
  fetchUserById: (...args) => mockFetchUserById(...args),
}));

describe('MessagesPage Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders conversation list', () => {
    customRender(<MessagesPage />);
    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  test('shows "select a conversation" when none chosen', () => {
    customRender(<MessagesPage />);
    expect(screen.getByText('Select a conversation')).toBeInTheDocument();
  });

  test('typing and sending a message works', async () => {
    mockFetchMessages.mockResolvedValue({ messages: [] });
    mockSendMessage.mockResolvedValue({});

    customRender(<MessagesPage />);

    fireEvent.click(screen.getByText('Alice'));

    fireEvent.change(screen.getByPlaceholderText('Type a message...'), {
      target: { value: 'Hello Alice' },
    });

    fireEvent.click(screen.getByText('Send'));

    await waitFor(() =>
      expect(mockSendMessage).toHaveBeenCalledWith(
        'user1',
        'Hello Alice',
        'test-token'
      )
    );
  });

  test('shows error when API fails', async () => {
    mockFetchMessages.mockRejectedValue(new Error('Failed to load messages'));

    customRender(<MessagesPage />);

    fireEvent.click(screen.getByText('Alice'));

    expect(await screen.findByText('Failed to load messages')).toBeInTheDocument();
  });


  test('message input does not send empty message', async () => {
    customRender(<MessagesPage />);

    fireEvent.click(screen.getByText('Alice'));

    fireEvent.click(screen.getByText('Send'));

    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
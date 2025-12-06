import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudyFeed from '../../src/app/components/course-detail/StudyFeed';
import CourseChat from '../../src/app/components/course-detail/CourseChat';
import { GamificationProvider } from '../../src/app/context/GamificationContext';

// Mock contexts
jest.mock('../../src/app/context/DarkModeContext', () => ({
  useDarkMode: () => ({ darkMode: false }),
}));

jest.mock('../../src/app/context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'user123', name: 'Test User' },
    token: 'test-token',
  }),
}));

// Mock hooks
jest.mock('../../src/app/hooks/useCourseActivity', () => ({
  useStudySessions: jest.fn(),
  useStudySessionStats: jest.fn(),
  useCoursePosts: jest.fn(),
}));

// Mock API functions
jest.mock('../../src/app/lib/api/courseActivity', () => ({
  likeStudySession: jest.fn(),
  deleteStudySession: jest.fn(),
  createCoursePost: jest.fn(),
  editCoursePost: jest.fn(),
  deleteCoursePost: jest.fn(),
}));

import { useStudySessions, useStudySessionStats, useCoursePosts } from '../../src/app/hooks/useCourseActivity';
import { likeStudySession, deleteStudySession, createCoursePost } from '../../src/app/lib/api/courseActivity';

const customRender = (ui) =>
  render(<GamificationProvider>{ui}</GamificationProvider>);

describe('StudyFeed Component', () => {
  const mockSessions = [
    {
      _id: 'session1',
      userId: { _id: 'user1', name: 'Alice', major: 'CS' },
      topic: 'Algorithms',
      subtopics: ['Sorting', 'Searching'],
      duration: 120,
      difficulty: 'Medium',
      location: 'Library',
      whatILearned: 'Learned about quicksort implementation',
      studyTechnique: 'Practice Problems',
      createdAt: '2024-01-15T10:00:00Z',
      likes: ['user2'],
    },
  ];

  const mockStats = {
    totalHours: 10,
    totalSessions: 5,
    currentStreak: 3,
    averageSessionMinutes: 90,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useStudySessions.mockReturnValue({
      sessions: mockSessions,
      count: 1,
      loading: false,
      refetch: jest.fn(),
      setSessions: jest.fn(),
    });
    useStudySessionStats.mockReturnValue({
      userStats: mockStats,
      refetch: jest.fn(),
    });
  });

  test('renders study feed with sessions and stats', () => {
    customRender(<StudyFeed classId="class123" token="test-token" baseUrl="http://localhost:4000/api" />);
    
    // Header and count
    expect(screen.getByText('Study Sessions')).toBeInTheDocument();
    expect(screen.getByText('1 study session created')).toBeInTheDocument();
    
    // Session details
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Algorithms')).toBeInTheDocument();
    
    // Stats
    expect(screen.getByText('Your Study Stats')).toBeInTheDocument();
  });

  test('calls like function when like button clicked', async () => {
    likeStudySession.mockResolvedValueOnce({});
    
    customRender(<StudyFeed classId="class123" token="test-token" baseUrl="http://localhost:4000/api" />);
    
    const likeButton = screen.getByText('1 like');
    fireEvent.click(likeButton);
    
    await waitFor(() => {
      expect(likeStudySession).toHaveBeenCalledWith('session1', 'test-token');
    });
  });

  test('shows empty state when no sessions', () => {
    useStudySessions.mockReturnValue({
      sessions: [],
      count: 0,
      loading: false,
      refetch: jest.fn(),
      setSessions: jest.fn(),
    });

    customRender(<StudyFeed classId="class123" token="test-token" baseUrl="http://localhost:4000/api" />);
    
    expect(screen.getByText('No study sessions yet')).toBeInTheDocument();
  });
});

describe('CourseChat Component', () => {
  const mockMessages = [
    {
      _id: 'msg1',
      author: { _id: 'user1', name: 'Alice', major: 'CS' },
      content: 'Hello everyone!',
      createdAt: '2024-01-15T10:00:00Z',
      editedAt: null,
    },
    {
      _id: 'msg2',
      author: { _id: 'user123', name: 'Test User', major: 'Math' },
      content: 'Hi Alice!',
      createdAt: '2024-01-15T10:05:00Z',
      editedAt: null,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useCoursePosts.mockReturnValue({
      messages: mockMessages,
      count: 2,
      loading: false,
      refetch: jest.fn(),
      setMessages: jest.fn(),
    });
  });

  test('renders chat with messages', () => {
    customRender(<CourseChat classId="class123" token="test-token" baseUrl="http://localhost:4000/api" />);
    
    expect(screen.getByText('Class Chat')).toBeInTheDocument();
    expect(screen.getByText('2 messages')).toBeInTheDocument();
    expect(screen.getByText('Hello everyone!')).toBeInTheDocument();
    expect(screen.getByText('Hi Alice!')).toBeInTheDocument();
  });

  test('can type and send message', async () => {
    createCoursePost.mockResolvedValueOnce({ xpAwarded: 10 });
    const mockRefetch = jest.fn();
    useCoursePosts.mockReturnValue({
      messages: mockMessages,
      count: 2,
      loading: false,
      refetch: mockRefetch,
      setMessages: jest.fn(),
    });

    customRender(<CourseChat classId="class123" token="test-token" baseUrl="http://localhost:4000/api" />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'New message' } });
    
    const sendButton = screen.getByText('Send');
    expect(sendButton).not.toBeDisabled();
    
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(createCoursePost).toHaveBeenCalledWith('class123', 'New message', 'test-token');
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  test('shows empty state when no messages', () => {
    useCoursePosts.mockReturnValue({
      messages: [],
      count: 0,
      loading: false,
      refetch: jest.fn(),
      setMessages: jest.fn(),
    });

    customRender(<CourseChat classId="class123" token="test-token" baseUrl="http://localhost:4000/api" />);
    
    expect(screen.getByText('No messages yet')).toBeInTheDocument();
    expect(screen.getByText('Start the conversation!')).toBeInTheDocument();
  });
});
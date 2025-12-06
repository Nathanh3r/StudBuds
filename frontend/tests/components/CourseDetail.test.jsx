import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CourseJoinPrompt from '../../src/app/components/course-detail/CourseJoinPrompt';
import CourseOverview from '../../src/app/components/course-detail/CourseOverview';
import CoursePeople from '../../src/app/components/course-detail/CoursePeople';
import CourseSections from '../../src/app/components/course-detail/CourseSections';
import CourseNotes from '../../src/app/components/course-detail/CourseNotes';
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

// Mock fetch for API calls
global.fetch = jest.fn();

const customRender = (ui) =>
  render(<GamificationProvider>{ui}</GamificationProvider>);

describe('CourseJoinPrompt Component', () => {
  test('renders join prompt with course code', () => {
    const mockJoin = jest.fn();
    render(<CourseJoinPrompt courseCode="CS101" onJoin={mockJoin} />);
    
    expect(screen.getByText('Join CS101')).toBeInTheDocument();
    expect(screen.getByText(/Access course materials/i)).toBeInTheDocument();
  });

  test('calls onJoin when join button is clicked', () => {
    const mockJoin = jest.fn();
    render(<CourseJoinPrompt courseCode="CS101" onJoin={mockJoin} />);
    
    const joinButton = screen.getByText('Join Course');
    fireEvent.click(joinButton);
    
    expect(mockJoin).toHaveBeenCalledTimes(1);
  });
});

describe('CourseOverview Component', () => {
  const mockClassData = {
    description: 'Introduction to Computer Science',
    department: 'Computer Science',
    units: 4,
    instructionalMethod: 'Lecture',
    instructor: {
      name: 'Dr. Smith',
      email: 'smith@university.edu',
    },
    sections: [],
  };

  test('renders course overview with all details', () => {
    render(<CourseOverview classData={mockClassData} />);
    
    // Description
    expect(screen.getByText('Course Description')).toBeInTheDocument();
    expect(screen.getByText('Introduction to Computer Science')).toBeInTheDocument();
    
    // Course details
    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    
    // Instructor email
    const emailLink = screen.getByText('smith@university.edu');
    expect(emailLink).toHaveAttribute('href', 'mailto:smith@university.edu');
  });

  test('shows default message when no description available', () => {
    const dataWithoutDescription = { ...mockClassData, description: null };
    render(<CourseOverview classData={dataWithoutDescription} />);
    
    expect(screen.getByText('No description available for this course.')).toBeInTheDocument();
  });
});

describe('CourseSections Component', () => {
  const mockSections = [
    {
      sectionNumber: '001',
      scheduleType: 'Lecture',
      enrollment: 25,
      maxEnrollment: 30,
      instructor: 'Dr. Johnson',
      meetingTimes: [
        {
          days: ['Mon', 'Wed', 'Fri'],
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          location: 'Room 101',
        },
      ],
    },
    {
      sectionNumber: '002',
      scheduleType: 'Discussion',
      enrollment: 15,
      maxEnrollment: 20,
      instructor: 'TA Brown',
      meetingTimes: [
        {
          days: ['Tue', 'Thu'],
          startTime: '2:00 PM',
          endTime: '3:00 PM',
          location: 'Online',
        },
      ],
    },
  ];

  test('renders sections with all details', () => {
    render(<CourseSections sections={mockSections} />);
    
    // Section numbers
    expect(screen.getByText('Section 001')).toBeInTheDocument();
    expect(screen.getByText('Section 002')).toBeInTheDocument();
    
    // Enrollment
    expect(screen.getByText('25/30')).toBeInTheDocument();
    
    // Meeting times
    expect(screen.getByText('Mon, Wed, Fri')).toBeInTheDocument();
    expect(screen.getByText(/10:00 AM - 11:00 AM/)).toBeInTheDocument();
    
    // Online indicator - use regex to match text that contains "Online"
    expect(screen.getByText(/Online/)).toBeInTheDocument();
  });

  test('shows empty state when no sections available', () => {
    render(<CourseSections sections={[]} />);
    
    expect(screen.getByText('No Sections Available')).toBeInTheDocument();
  });
});

describe('CoursePeople Component', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('renders members list when data is loaded', async () => {
    const mockMembers = [
      { _id: '1', name: 'Alice Johnson', major: 'Computer Science', year: 'Junior' },
      { _id: '2', name: 'Bob Smith', major: 'Mathematics', year: 'Senior' },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: mockMembers }),
    });

    render(<CoursePeople classId="123" token="test-token" baseUrl="http://localhost:4000/api" />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('2 StudBuds enrolled')).toBeInTheDocument();
    });
  });

  test('displays empty state when no members', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: [] }),
    });

    render(<CoursePeople classId="123" token="test-token" baseUrl="http://localhost:4000/api" />);

    await waitFor(() => {
      expect(screen.getByText('No members yet')).toBeInTheDocument();
    });
  });
});

describe('CourseNotes Component', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  test('renders notes list with details', async () => {
    const mockNotes = [
      {
        _id: '1',
        title: 'Midterm Review',
        description: 'Comprehensive review notes',
        uploadedBy: { name: 'Alice' },
        createdAt: '2024-01-15',
        downloadCount: 5,
        fileUrl: 'http://example.com/note1.pdf',
        fileName: 'midterm.pdf',
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notes: mockNotes }),
    });

    customRender(<CourseNotes classId="123" token="test-token" baseUrl="http://localhost:4000/api" />);

    await waitFor(() => {
      expect(screen.getByText('Midterm Review')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive review notes')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('5 downloads')).toBeInTheDocument();
    });
  });

  test('displays empty state when no notes', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notes: [] }),
    });

    customRender(<CourseNotes classId="123" token="test-token" baseUrl="http://localhost:4000/api" />);

    await waitFor(() => {
      expect(screen.getByText('No notes yet')).toBeInTheDocument();
    });
  });
});
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import StudyGroups from '../../src/app/components/course-detail/StudyGroups';
import { useStudyGroups } from '../../src/app/hooks/useCourseActivity';

jest.mock('../../src/app/hooks/useCourseActivity');

jest.mock('../../src/app/context/DarkModeContext', () => ({
  useDarkMode: () => ({
    darkMode: false,
  }),
}));

// ✅ Mock GamificationContext so useGamification() is safe to call
jest.mock('../../src/app/context/GamificationContext', () => ({
  useGamification: () => ({
    handleXPAward: jest.fn(),
    showLevelUpModal: false,
    levelUpData: null,
  }),
}));

test('renders study group names', () => {
  const groups = [
    { _id: 'g1', name: 'Study Group 1', members: [] },
    { _id: 'g2', name: 'Study Group 2', members: [] },
  ];

  useStudyGroups.mockReturnValue({
    studyGroups: groups,
    loading: false,
  });

  render(<StudyGroups classId="123" token="abc" user={{ _id: 'u1' }} />);

  expect(screen.getByText('Study Group 1')).toBeInTheDocument();
  expect(screen.getByText('Study Group 2')).toBeInTheDocument();
});

test('shows loading spinner when loading', () => {
  useStudyGroups.mockReturnValue({
    studyGroups: [],
    loading: true,
  });

  const { container } = render(
    <StudyGroups classId="123" token="abc" user={{ _id: 'u1' }} />
  );

  // LoadingSpinner in your code uses a div with `animate-spin`
  expect(container.querySelector('.animate-spin')).toBeTruthy();
});

test('shows empty message when no study groups', () => {
  useStudyGroups.mockReturnValue({
    studyGroups: [],
    loading: false,
  });

  render(<StudyGroups classId="123" token="abc" user={{ _id: 'u1' }} />);

  expect(screen.getByText(/No study groups yet/i)).toBeInTheDocument();
});

test('shows Join Group button for non-members', () => {
  useStudyGroups.mockReturnValue({
    studyGroups: [{ _id: 'g1', name: 'Midterm Review', members: [] }],
    loading: false,
  });

  render(<StudyGroups classId="123" token="abc" user={{ _id: 'u1' }} />);

  expect(
    screen.getByRole('button', { name: /Join Group/i })
  ).toBeInTheDocument();
});

test('shows Leave Group button for members', () => {
  useStudyGroups.mockReturnValue({
    studyGroups: [
      {
        _id: 'g1',
        name: 'Midterm Review',
        members: [{ _id: 'u1', name: 'Aryan' }],
      },
    ],
    loading: false,
  });

  render(<StudyGroups classId="123" token="abc" user={{ _id: 'u1' }} />);

  expect(
    screen.getByRole('button', { name: /Leave Group/i })
  ).toBeInTheDocument();
});

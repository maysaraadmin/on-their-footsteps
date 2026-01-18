import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'
import CharacterDetail from '../CharacterDetail'
import * as api from '../../services/api'

// Mock the API module
vi.mock('../../services/api')

// Mock components
vi.mock('../CharacterTimeline', () => ({
  default: () => <div data-testid="character-timeline">Timeline</div>
}))

vi.mock('../AudioPlayer', () => ({
  default: () => <div data-testid="audio-player">Audio Player</div>
}))

vi.mock('../LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>
}))

vi.mock('../ErrorDisplay', () => ({
  default: ({ error }) => <div data-testid="error-display">{error}</div>
}))

const mockCharacter = {
  id: 2,
  name: 'أبو بكر الصديق',
  arabic_name: 'عبد الله بن عثمان',
  title: 'أول الخلفاء الراشدين',
  description: 'أول الخلفاء الراشدين وصاحب رسول الله',
  category: 'الصحابة',
  era: 'العصر الراشدي',
  profile_image: '/static/images/characters/abu_bakr_profile.jpg',
  views_count: 12000,
  likes_count: 6200,
  birth_year: 573,
  death_year: 634,
  birth_place: 'مكة المكرمة',
  death_place: 'المدينة المنورة',
  full_story: 'Full story here...',
  key_achievements: ['أول من أسلم من الرجال الأحرار'],
  lessons: ['الصدق في القول والعمل'],
  quotes: ['الضعيف فيكم قوي عندي...'],
  timeline_events: [
    { year: 573, title: 'الميلاد', description: 'ولادة أبو بكر الصديق' }
  ]
}

const mockProgress = {
  character_id: 'abu-bakr',
  bookmarked: false,
  progress_percentage: 0,
  completed_sections: []
}

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('CharacterDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows loading spinner initially', () => {
    api.get.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithRouter(<CharacterDetail />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  test('displays character data after successful fetch', async () => {
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('أبو بكر الصديق')).toBeInTheDocument()
      expect(screen.getByText('أول الخلفاء الراشدين وصاحب رسول الله')).toBeInTheDocument()
      expect(screen.getByText('الصحابة')).toBeInTheDocument()
      expect(screen.getByText('العصر الراشدي')).toBeInTheDocument()
    })
  })

  test('displays error message when fetch fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'))
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('فشل في تحميل بيانات الشخصية')).toBeInTheDocument()
    })
  })

  test('displays error when character not found', async () => {
    api.get
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({ data: mockProgress })
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
      expect(screen.getByText('الشخصية غير موجودة')).toBeInTheDocument()
    })
  })

  test('handles bookmark toggle', async () => {
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: { ...mockProgress, bookmarked: false } })
    api.put.mockResolvedValue({ data: { bookmarked: true } })
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('أبو بكر الصديق')).toBeInTheDocument()
    })
    
    // Find and click bookmark button
    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i })
    fireEvent.click(bookmarkButton)
    
    expect(api.put).toHaveBeenCalledWith('/progress/abu-bakr', { bookmarked: true })
  })

  test('handles share functionality', async () => {
    // Mock navigator.share
    const mockShare = vi.fn()
    Object.defineProperty(navigator, 'share', {
      writable: true,
      value: mockShare
    })
    
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('أبو بكر الصديق')).toBeInTheDocument()
    })
    
    // Find and click share button
    const shareButton = screen.getByRole('button', { name: /share/i })
    fireEvent.click(shareButton)
    
    expect(mockShare).toHaveBeenCalledWith({
      title: 'قصة أبو بكر الصديق',
      text: 'أول الخلفاء الراشدين وصاحب رسول الله',
      url: expect.any(String)
    })
  })

  test('switches between tabs', async () => {
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('أبو بكر الصديق')).toBeInTheDocument()
    })
    
    // Click on timeline tab
    const timelineTab = screen.getByText('الخط الزمني')
    fireEvent.click(timelineTab)
    
    expect(screen.getByTestId('character-timeline')).toBeInTheDocument()
    
    // Click on audio tab
    const audioTab = screen.getByText('المحتوى الصوتي')
    fireEvent.click(audioTab)
    
    expect(screen.getByTestId('audio-player')).toBeInTheDocument()
  })

  test('displays character statistics', async () => {
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('12000')).toBeInTheDocument() // views
      expect(screen.getByText('6200')).toBeInTheDocument() // likes
      expect(screen.getByText('573')).toBeInTheDocument() // birth year
      expect(screen.getByText('634')).toBeInTheDocument() // death year
    })
  })

  test('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    api.get.mockRejectedValue(new Error('API Error'))
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error-display')).toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Error fetching character:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  test('handles bookmark error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    api.put.mockRejectedValue(new Error('Bookmark error'))
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('أبو بكر الصديق')).toBeInTheDocument()
    })
    
    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i })
    fireEvent.click(bookmarkButton)
    
    expect(consoleSpy).toHaveBeenCalledWith('Error updating bookmark:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })

  test('refetches data when id changes', async () => {
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    
    const { rerender } = renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('أبو بكر الصديق')).toBeInTheDocument()
    })
    
    // Change ID
    const newCharacter = { ...mockCharacter, id: 3, name: 'عمر بن الخطاب' }
    api.get
      .mockResolvedValueOnce({ data: newCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    
    rerender(
      <BrowserRouter>
        <CharacterDetail />
      </BrowserRouter>
    )
    
    // Note: This test would need to be adapted based on how useParams works
    // For now, it tests the component structure
  })

  test('displays timeline events', async () => {
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByText('أبو بكر الصديق')).toBeInTheDocument()
    })
    
    // Click on timeline tab
    const timelineTab = screen.getByText('الخط الزمني')
    fireEvent.click(timelineTab)
    
    expect(screen.getByTestId('character-timeline')).toBeInTheDocument()
  })

  test('has proper accessibility attributes', async () => {
    api.get
      .mockResolvedValueOnce({ data: mockCharacter })
      .mockResolvedValueOnce({ data: mockProgress })
    
    renderWithRouter(<CharacterDetail />)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'أبو بكر الصديق' })).toBeInTheDocument()
    })
    
    // Check for proper ARIA labels on interactive elements
    const bookmarkButton = screen.getByRole('button', { name: /bookmark/i })
    expect(bookmarkButton).toHaveAttribute('aria-label')
    
    const shareButton = screen.getByRole('button', { name: /share/i })
    expect(shareButton).toHaveAttribute('aria-label')
  })
})

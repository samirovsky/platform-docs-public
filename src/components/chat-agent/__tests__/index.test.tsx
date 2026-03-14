import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatAgent from '../index';
import { useChat } from '@ai-sdk/react';

// Mock the ai-sdk/react useChat hook
jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn(),
}));

describe('ChatAgent Component', () => {
  const mockHandleInputChange = jest.fn();
  const mockHandleSubmit = jest.fn();

  beforeEach(() => {
    (useChat as jest.Mock).mockReturnValue({
      messages: [],
      input: '',
      handleInputChange: mockHandleInputChange,
      handleSubmit: mockHandleSubmit,
    });
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('renders a floating button initially', () => {
    render(<ChatAgent />);
    const openButton = screen.getByRole('button', { name: /open chat/i });
    expect(openButton).toBeInTheDocument();

    // The chat window shouldn't be open yet
    expect(screen.queryByText('Mistral AI Assistant')).not.toBeInTheDocument();
  });

  it('opens the chat window when the floating button is clicked', async () => {
    render(<ChatAgent />);
    const openButton = screen.getByRole('button', { name: /open chat/i });

    await userEvent.click(openButton);

    expect(screen.getByText('Mistral AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask something...')).toBeInTheDocument();
  });

  it('closes the chat window when the close button is clicked', async () => {
    render(<ChatAgent />);
    // Open chat
    const openButton = screen.getByRole('button', { name: /open chat/i });
    await userEvent.click(openButton);

    // Close chat
    const closeButtons = screen.getAllByRole('button');
    // Assuming the second button is the close button (after iterating)
    // Finding it directly by finding the closest button to "Ask questions"
    const closeBtn = screen.getAllByRole('button')[0];
    await userEvent.click(closeBtn);

    expect(screen.queryByText('Mistral AI Assistant')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open chat/i })).toBeInTheDocument();
  });

  it('displays a selection box when text is selected', () => {
    // We can simulate selection change manually
    render(
      <div>
        <div data-testid="test-content">Some text here to select</div>
        <ChatAgent />
      </div>
    );

    const openButton = screen.getByRole('button', { name: /open chat/i });
    fireEvent.click(openButton);

    // Mock window.getSelection
    const getSelectionMock = jest.fn().mockReturnValue({
      toString: () => 'selected dummy text',
    });
    window.getSelection = getSelectionMock;

    // Trigger selection change event
    fireEvent(document, new Event('selectionchange'));

    expect(screen.getByText(/selected context:/i)).toBeInTheDocument();
    expect(screen.getByText(/"selected dummy text"/)).toBeInTheDocument();
  });

  it('submits a message when the user types and sends', async () => {
    // Setup the mock to simulate input changing
    let inputValue = '';
    (useChat as jest.Mock).mockImplementation(() => ({
      messages: [],
      input: inputValue,
      handleInputChange: (e: any) => {
        inputValue = e.target.value;
        mockHandleInputChange(e);
      },
      handleSubmit: (e: any) => {
        e.preventDefault();
        mockHandleSubmit(e);
      },
    }));

    const { rerender } = render(<ChatAgent />);
    const openButton = screen.getByRole('button', { name: /open chat/i });
    await userEvent.click(openButton);

    const input = screen.getByPlaceholderText('Ask something...');
    const submitBtn = screen.getAllByRole('button').find(b => b.getAttribute('type') === 'submit')!;

    // Type a message
    fireEvent.change(input, { target: { value: 'Hello Mistral' } });
    rerender(<ChatAgent />);

    // Ensure button is not disabled
    expect(submitBtn).not.toBeDisabled();

    // Submit form
    fireEvent.submit(input);

    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});

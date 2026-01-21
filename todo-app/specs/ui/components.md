# UI Components Specification

## Component Structure
The UI follows Next.js App Router structure with React components.

## Layout Components

### Navbar
- Shows app title
- Displays user information when logged in
- Login/Register links when not authenticated
- Logout button when authenticated

## Page Components

### Welcome Page (`/welcome`)
- Marketing content for unauthenticated users
- Call-to-action buttons for registration/login

### Login Page (`/login`)
- Email and password fields
- Form validation
- Error messaging
- Link to registration page

### Registration Page (`/register`)
- Email, password, and optional name fields
- Form validation
- Error messaging
- Link to login page

### Task Management Page (`/`)
- Task creation form
- Task list with filtering controls
- Task sorting options
- Individual task editing controls

## Reusable Components

### Task Card
- Displays task title, description, and completion status
- Edit and delete buttons
- Checkbox for completion toggle

### Task Form
- Input fields for task title and description
- Submit button
- Validation feedback

### Filter Controls
- Buttons for filtering tasks (all/active/completed)
- Sort options (by date or title)

## Styling
- Tailwind CSS for responsive styling
- Dark/light mode support
- Mobile-first responsive design
- Accessible color contrast ratios
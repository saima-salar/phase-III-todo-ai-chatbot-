# UI Pages Specification

## Page Structure
All pages follow Next.js 14+ App Router conventions with client-side rendering where needed.

## Page Descriptions

### Welcome Page (`/welcome`)
**Purpose**: Landing page for unauthenticated users
**Components**:
- Hero section with app description
- Call-to-action buttons
- Feature highlights

**Behavior**:
- Redirects authenticated users to main app
- Provides links to login/registration

### Login Page (`/login`)
**Purpose**: User authentication
**Components**:
- Email input field
- Password input field
- Submit button
- Error display area
- Navigation to registration

**Behavior**:
- Form validation
- Authentication request to backend
- Redirect to main app on success
- Error messaging on failure

### Registration Page (`/register`)
**Purpose**: New user account creation
**Components**:
- Email input field
- Password input field
- First/last name fields (optional)
- Submit button
- Error display area
- Navigation to login

**Behavior**:
- Form validation
- Account creation request
- Auto-login after registration
- Redirect to main app on success

### Main Task Page (`/`)
**Purpose**: Core task management functionality
**Components**:
- Navigation bar
- Task creation form
- Task filtering controls
- Task sorting controls
- Task list with individual task cards

**Behavior**:
- Redirects unauthenticated users to welcome page
- Fetches user's tasks from backend
- Provides CRUD operations for tasks
- Real-time updates after operations
- Filtering and sorting capabilities
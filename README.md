# Reminder App UI

A modern, responsive reminder application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Dashboard**: Overview of all reminders with filtering and search
- **Calendar View**: Monthly calendar display with event integration
- **Reminder Management**: Create, edit, delete, and complete reminders
- **Categories & Priorities**: Organize reminders by category and priority
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Toggle**: Light and dark mode support
- **Calendar API Integration**: Fetches events from external calendar APIs

## Recent Updates

### Calendar API Integration
The app now integrates with external calendar APIs to display events:

- **Monthly Calendar View**: Shows events for the current month
- **Event Display**: Events are displayed on their respective dates with priority indicators
- **API Endpoints**: Supports multiple calendar API endpoints including:
  - Get calendar events with date range filtering
  - Get events by specific date
  - Get current month/week calendar data
  - Get calendar summary statistics

### Bug Fixes
- **Invalid Date Issues**: Fixed date parsing errors that caused "Invalid Date" displays
- **Theme Toggle**: Improved theme toggle icon display and transitions
- **Error Handling**: Added comprehensive error handling for API failures and invalid data

## API Endpoints

The calendar integration supports the following API endpoints:

```
GET /api/calendar/events?startDate=2024-01-01&endDate=2024-01-31&view=month
GET /api/calendar/events/date/2024-01-15
GET /api/calendar/month/current
GET /api/calendar/month/2024/1
GET /api/calendar/week
GET /api/calendar/summary
```

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Usage

### Dashboard
- View all reminders in organized tabs (Upcoming, Overdue, Completed, Calendar)
- Filter reminders by category, priority, and search terms
- Quick overview of reminder statistics

### Calendar View
- Navigate between months using arrow buttons
- Click on events to view details
- Events are color-coded by priority (High: Red, Medium: Blue, Low: Gray)

### Adding Reminders
- Click "Add Reminder" button
- Fill in event details including date, time, category, and priority
- Set recurring options if needed

## Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React hooks
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
reminder-app-ui/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── add-reminder/      # Add reminder form
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── calendar-view.tsx # Calendar component
│   ├── reminder-card.tsx # Reminder display card
│   └── reminder-form.tsx # Reminder form
├── services/             # API services
│   └── api.ts           # API client and types
└── hooks/               # Custom React hooks
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

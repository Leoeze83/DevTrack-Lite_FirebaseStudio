// __mocks__/lucide-react.js
const React = require('react');

const createLucideIcon = (iconName) => {
  return React.forwardRef((props, ref) => {
    // Remove className from props to avoid passing it to the svg element if it's not a valid attribute for svg
    const { className, ...rest } = props; 
    return React.createElement('svg', {
      ref,
      'data-testid': `${iconName}-icon`, // Useful for testing
      // Spread the rest of the props here
      ...rest,
    });
  });
};

module.exports = {
  // List all icons that are imported and used by your components.
  MoreVertical: createLucideIcon('MoreVertical'),
  Timer: createLucideIcon('Timer'),
  LayoutGrid: createLucideIcon('LayoutGrid'),
  List: createLucideIcon('List'),
  SearchX: createLucideIcon('SearchX'),
  Info: createLucideIcon('Info'),
  Loader2: createLucideIcon('Loader2'),
  Wand2: createLucideIcon('Wand2'),
  CircleDot: createLucideIcon('CircleDot'),
  LoaderCircle: createLucideIcon('LoaderCircle'),
  PauseCircle: createLucideIcon('PauseCircle'),
  CheckCircle2: createLucideIcon('CheckCircle2'),
  Archive: createLucideIcon('Archive'),
  Clock: createLucideIcon('Clock'), // Example, might not be used
  ChevronDown: createLucideIcon('ChevronDown'), 
  ChevronUp: createLucideIcon('ChevronUp'), // Used in Select component
  Check: createLucideIcon('Check'), 
  ChevronRight: createLucideIcon('ChevronRight'), // Used in DropdownMenu
  Circle: createLucideIcon('Circle'), // Used in DropdownMenu
  Calendar: createLucideIcon('Calendar'), // Example, might not be used
  X: createLucideIcon('X'), // Example, might not be used for dialogs
  // Add any other icons you identify from component imports.
  // From ticket-list.tsx (statusIcons specifically):
  // CircleDot, LoaderCircle, PauseCircle, CheckCircle2, Archive are already listed.
  // From ticket-form.tsx:
  // Wand2, Loader2 are already listed.
  // From select.tsx:
  // Check, ChevronDown, ChevronUp are already listed.
  // From dropdown-menu.tsx:
  // Check, ChevronRight, Circle are already listed.
};

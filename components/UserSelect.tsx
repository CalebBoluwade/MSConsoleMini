import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search } from "lucide-react";
import useDebouncedSearch from "@/lib/hooks/useDebouncedSearch";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

// User interface
interface User {
  id: string;
  name: string;
  jobTitle: string;
  avatar: string;
  initials: string;
}

// Component prop interfaces
interface UserSelectItemProps {
  user: User;
  isSelected: boolean;
  onToggle: (userId: string) => void;
}

interface SelectedUserBadgeProps {
  user: User;
  onRemove: (userId: string) => void;
}

interface UserSelectValueProps {
  selectedUsers: User[];
  placeholder?: string;
}

interface UserSelectDropdownProps {
  users: User[];
  value: User[];
  onChange: (selectedUsers: User[]) => void;
  placeholder?: string;
  label?: string;
  maxHeight?: string;
  searchPlaceholder?: string;
  enableSearch?: boolean;
  error?: string;
  id?: string;
}

const UserSelectItem: React.FC<UserSelectItemProps> = ({
  user,
  isSelected,
  onToggle,
}) => (
  <div
    // role="option"
    // aria-selected={isSelected}
    // tabIndex={0}
    className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 cursor-pointer rounded-sm"
    onClick={() => onToggle(user.id)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(user.id);
      }
    }}
  >
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => onToggle(user.id)} //  ✅ Correct event
      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
      aria-label={`Select ${user.name}`}
    />
    <Avatar className="h-8 w-8">
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
        {user.initials}
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="font-medium text-sm">{user.name}</span>
      <span className="text-xs text-gray-500">{user.jobTitle}</span>
    </div>
  </div>
);

const SelectedUserBadge: React.FC<SelectedUserBadgeProps> = ({
  user,
  onRemove,
}) => (
  <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
    <Avatar className="h-5 w-5">
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback className="text-xs bg-blue-200 text-blue-700">
        {user.initials}
      </AvatarFallback>
    </Avatar>
    <span className="font-medium">{user.name}</span>
    <Button
      variant={"ghost"}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(user.id);
      }}
      className="hover:bg-blue-200 rounded-full p-1"
      aria-label={`Remove ${user.name}`}
    >
      <X className="h-3 w-3" />
    </Button>
  </div>
);

const UserSelectValue: React.FC<UserSelectValueProps> = ({
  selectedUsers,
  placeholder = "Select users...",
}) => {
  if (selectedUsers.length === 0) {
    return <span className="text-gray-500">{placeholder}</span>;
  }

  if (selectedUsers.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage
            src={selectedUsers[0].avatar}
            alt={selectedUsers[0].name}
          />
          <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
            {selectedUsers[0].initials}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{selectedUsers[0].name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {selectedUsers.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="h-6 w-6 border-2 border-white">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span className="font-medium">
        {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
        selected
      </span>
    </div>
  );
};

const UserSelectDropdown: React.FC<UserSelectDropdownProps> = ({
  users,
  value = [],
  onChange,
  placeholder = "Select users...",
  label = "Assign to Users",
  maxHeight = "max-h-60",
  searchPlaceholder = "Search users...",
  enableSearch = true,
  error,
  id = "user-select",
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const debouncedSearchTerm = useDebouncedSearch(searchQuery, 300);

  const selectedUserIds = value.map((user) => user.id);

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!debouncedSearchTerm.trim()) return users;

    const query = debouncedSearchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.jobTitle.toLowerCase().includes(query)
    );
  }, [users, debouncedSearchTerm]);

const toggleUser = React.useCallback((userId: string) => {
  const user = users.find((u) => u.id === userId);
  if (!user) return;

   const isSelected = value.some((u) => u.id === userId);
  const newSelectedUsers = isSelected
    ? value.filter((u) => u.id !== userId)
    : [...value, user];

  // Only call onChange if there's a change
  if (JSON.stringify(newSelectedUsers) !== JSON.stringify(value)) {
    onChange(newSelectedUsers);
  }
}, [value, users, onChange]);

  const removeUser = React.useCallback((userId: string): void => {
    const newSelectedUsers = value.filter((u) => u.id !== userId);
    onChange(newSelectedUsers);
  }, [onChange, value]);

  const clearAll = React.useCallback((): void => {
    onChange([]);
  }, [onChange]);

  const clearSearch = React.useCallback((): void => {
    setSearchQuery("");
  }, []);

  // Reset search when dropdown closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-user-select-dropdown]")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  // const handleKeyDown = (e: React.KeyboardEvent) => {
  //   if (e.key === "Escape") {
  //     setIsOpen(false);
  //   } else if (e.key === "Tab" && isOpen) {
  //     setIsOpen(false);
  //   }
  // };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700" htmlFor={id}>
        {label}
      </label>

      {/* Custom Select-like component */}
      <div className="relative" data-user-select-dropdown>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          type="button"
        >
          <UserSelectValue selectedUsers={value} placeholder={placeholder} />
          <svg
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </Button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Select Users
                </span>
                {value.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    type="button"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search Input */}
              {enableSearch && (
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <Button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              <div
                // id={listboxId}
                className={`${maxHeight} overflow-y-auto`}
                role="listbox"
                aria-multiselectable="true"
                aria-labelledby={`${id}-label`}
              >
                {filteredUsers.length === 0 ? (
                  <div
                    className="py-4 text-center text-sm text-gray-500"
                    role="option"
                  >
                    {searchQuery
                      ? `No users found matching "${searchQuery}"`
                      : "No users available"}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <UserSelectItem
                      key={user.id}
                      user={user}
                      isSelected={selectedUserIds.includes(user.id)}
                      onToggle={toggleUser}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Selected Users Display */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Selected Users ({value.length})
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-red-600 hover:text-red-800"
              type="button"
              aria-label="Remove all selected users"
            >
              Remove All
            </button>
          </div>

          <div className="flex flex-wrap gap-2" aria-live="polite">
            {value.map((user) => (
              <SelectedUserBadge
                key={user.id}
                user={user}
                onRemove={removeUser}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

UserSelectDropdown.displayName = "UserSelectDropdown";

export default UserSelectDropdown;

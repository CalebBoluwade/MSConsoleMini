import React from 'react';

interface User {
  id: string;
  name: string;
  jobTitle: string;
  avatar: string;
  initials: string;
}

interface UserSelectDropdownProps {
  value: string[];
  onChange: (selectedUsers: string[]) => void;
  label: string;
  placeholder: string;
  enableSearch?: boolean;
  users: User[];
}

const UserSelectDropdown: React.FC<UserSelectDropdownProps> = ({
  value,
  onChange,
  placeholder,
  users,
}) => {
  const handleUserToggle = (userId: string) => {
    const newValue = value.includes(userId)
      ? value.filter(id => id !== userId)
      : [...value, userId];
    onChange(newValue);
  };

  const selectedUsers = users.filter(user => value.includes(user.id));

  return (
    <div className="space-y-2">
      <div className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[40px] flex flex-wrap gap-1">
        {selectedUsers.length > 0 ? (
          selectedUsers.map(user => (
            <span
              key={user.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {user.name}
              <button
                type="button"
                onClick={() => handleUserToggle(user.id)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>
      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
        {users.map(user => (
          <div
            key={user.id}
            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleUserToggle(user.id)}
          >
            <input
              type="checkbox"
              placeholder='u---'
              checked={value.includes(user.id)}
              onChange={() => handleUserToggle(user.id)}
              className="mr-2"
            />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium mr-2">
                {user.initials}
              </div>
              <div>
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.jobTitle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserSelectDropdown;
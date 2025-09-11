import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import useDebouncedSearch from "@/lib/hooks/useDebouncedSearch";
import { Search } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

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
  users: User[];
}

const UserSelectDropdown: React.FC<UserSelectDropdownProps> = ({
  value = [],
  onChange,
  users,
}) => {
  const handleUserToggle = (userId: string) => {
    const newValue = value.includes(userId)
      ? value.filter((id) => id !== userId)
      : [...value, userId];
    onChange(newValue);
  };

  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const debouncedSearchTerm = useDebouncedSearch(searchQuery, 300);

  const [isOpen, setIsOpen] = useState(false);

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

  const selectedUsers = users.filter((user) => value.includes(user.id));

  return (
    <div className="space-y-2 relative">
      <div className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-wrap gap-1">
        {selectedUsers.length > 0 &&
          selectedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-sm bg-blue-200 text-blue-700">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <span>{user.name}</span>
              <Button
                type="button"
                variant={"ghost"}
                onClick={() => handleUserToggle(user.id)}
                className="p-0 text-blue-600 hover:text-blue-800"
              >
                ×
              </Button>
            </div>
          ))}
      </div>

      <Popover open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
        <PopoverTrigger className="relative mb-2 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Users"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value)
              setIsOpen(!isOpen)
            }
            }
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        </PopoverTrigger>

        <PopoverContent className="py-3 px-0 w-full lg:w-[38rem] --max-h-50 overflow-y-auto rounded-md">
          {filteredUsers.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="flex gap-2 items-center p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserToggle(user.id)}
              >
                <div className="flex gap-2 items-center">
                  <Input
                    type="checkbox"
                    placeholder=""
                    checked={value.includes(user.id)}
                    onChange={() => handleUserToggle(user.id)}
                    className="mr-2"
                  />

                  <Avatar key={user.id} className="flex items-center">
                    <AvatarImage src={user.avatar} alt="Avatar" />

                    <AvatarFallback>
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                        {user.initials}
                      </div>
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="w-full">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.jobTitle}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-2">
              No Users for &#34;{debouncedSearchTerm}&#34;
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* <div className="--absolute left-0 right-0  border border-gray-200 "></div> */}
    </div>
  );
};

export default UserSelectDropdown;

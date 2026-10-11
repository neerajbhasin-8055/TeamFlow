
const formConfig = {
  project: [
    {
      name: "name",
      label: "Project Name",
      type: "text",
      placeholder: "Enter project name",
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe the project",
      required: true,
      minLength: 10,
      maxLength: 500,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      options: [
        { label: "Not Started", value: "NOT_STARTED" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Completed", value: "COMPLETED" },
      ],
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
      required: true,
    },
    {
      name: "deadline",
      label: "Deadline",
      type: "date",
      required: true,
    },
    {
      name: "managerId",
      label: "Manager ID",
      type: "text",
      placeholder: "Enter manager user ID",
      required: false,
    },
    {
      name: "teamId",
      label: "Team ID",
      type: "text",
      placeholder: "Enter team ID",
      required: false,
    },
  ],

  task: [
    {
      name: "title",
      label: "Task Title",
      type: "text",
      placeholder: "Enter task title",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe the task",
      required: true,
    },
    {
      name: "deadline",
      label: "Deadline",
      type: "date",
      required: true,
    },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: [
        { label: "Low", value: "LOW" },
        { label: "Medium", value: "MEDIUM" },
        { label: "High", value: "HIGH" },
      ],
    },
    {
      name: "assignedTo",
      label: "Assign To (User ID)",
      type: "text",
      placeholder: "Enter assigned user's ID",
      required: true,
    },
    {
      name: "projectId",
      label: "Project ID",
      type: "text",
      placeholder: "Enter project ID",
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: false,
      options: [
        { label: "To Do", value: "TODO" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Completed", value: "COMPLETED" },
      ],
    },
  ],

  team: [
    {
      name: "name",
      label: "Team Name",
      type: "text",
      placeholder: "Enter team name",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Describe the team",
      required: true,
    },
  ],

  user: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter full name",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter email address",
      required: true,
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      required: true,
    },
  ],
};

export default formConfig;


import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiCheckCircle, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";

import { getAllUsers, deleteUser } from "../../services/adminApi";
import Loader from "../../components/Loader";
import { EmptyState } from "../../components/EmptyState";
import Modal from "../../components/Modal";

const ManageUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedUser(null);
    setIsDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser._id);
      setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
    } catch (error) {
      console.error("Delete failed", error);
    } finally {
      closeDeleteModal();
    }
  };

  const handleView = (id) => {
    navigate(`/users/${id}`);
  };

  const filteredUsers = useMemo(() => {
    if (!search) return users;

    const term = search.toLowerCase();

    return users.filter(
      (user) =>
        user.fullName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term)
    );
  }, [search, users]);

  const columns = [
    {
      name: "Name",
      selector: (row) => row.fullName,
      sortable: true
    },
    {
      name: "Username",
      selector: (row) => row.username,
      sortable: true,
      cell: (row) => `@${row.username}`
    },
    {
      name: "Email",
      selector: (row) => row.email
    },
    {
      name: "Role",
      selector: (row) => row.role,
      cell: (row) => <span className="capitalize">{row.role}</span>
    },
    {
      name: "Verified",
      cell: (row) =>
        row.isVerified ? (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <FiCheckCircle />
            Verified
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Not Verified</span>
        )
    },
    {
      name: "Joined At",
      selector: (row) => new Date(row.createdAt),
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleView(row._id)}
            className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
          >
            <FiEye />
            View
          </button>

          <button
            onClick={() => openDeleteModal(row)}
            className="text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <FiTrash2 />
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading) return <Loader fullScreen message="Loading users..." />;

  if (!users.length)
    return (
      <EmptyState
        title="No users found"
        description="There are no users in the system."
      />
    );

  return (
    <div className="p-6 space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <h1 className="text-2xl font-bold">Manage Users</h1>

        <input
          type="text"
          placeholder="Search name, email, username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-2 border-gray-300 dark:border-dark-600 rounded-lg px-3 py-2 text-sm w-64 focus:border-primary-500 focus:outline-none transition"
        />

      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">

        <DataTable
          columns={columns}
          data={filteredUsers}
          pagination
          highlightOnHover
          responsive
          striped
          paginationPerPage={10}
          paginationRowsPerPageOptions={[5, 10, 20, 50]}
        />

      </div>

      <Modal
        isOpen={isDeleteOpen}
        title="Delete User"
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to delete{" "}
          <span className="font-semibold">
            {selectedUser?.fullName}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>

    </div>
  );
};

export default ManageUsers;


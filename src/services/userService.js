const User = require('../models/User');

const getUsers = async (filters = {}, page = 1, limit = 5) => {
  const users = await User
  .paginate({ filters, page, limit })
  .select('-password')
  .execPaginate();
  return users;
};

const getUserById = async (id) => {
  return await User.findById(id);
};

const updateUserRole = async (id, role) => {
  return await User.findByIdAndUpdate(id, { role }, { new: true });
};

const toggleUserStatus = async (id, isActive) => {
  return await User.findByIdAndUpdate(id, { isActive }, { new: true });
};

const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};

module.exports = { getUsers, getUserById, updateUserRole, toggleUserStatus, deleteUser };

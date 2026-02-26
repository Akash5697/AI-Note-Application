const roleService = require('../services/roleService');

const getRoles = async (req, res) => {
  try {
    const roles = await roleService.getRoles(req.query.includeUserCount);
    res.json(roles);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const createRole = async (req, res) => {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json(role);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRole = async (req, res) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.json(role);
  } catch (err) {
    if (err.message === 'Role not found') return res.status(404).json({ message: err.message });
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteRole = async (req, res) => {
  try {
    await roleService.deleteRole(req.params.id);
    res.json({ message: 'Role removed' });
  } catch (err) {
    if (err.message === 'Role not found') return res.status(404).json({ message: err.message });
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id, req.query.includeUsers);
    res.json(role);
  } catch (err) {
    if (err.message === 'Role not found') return res.status(404).json({ message: err.message });
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsersByRoleType = async (req, res) => {
  try {
    const users = await roleService.getUsersByRoleType(req.params.roleType);
    res.json(users);
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ message: err.message });
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRoleStatistics = async (req, res) => {
  try {
    const stats = await roleService.getRoleStatistics();
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const bulkUpdateUserRoles = async (req, res) => {
  try {
    const results = await roleService.bulkUpdateUserRoles(req.body.updates);
    res.json({ results });
  } catch (err) {
    if (err.message === 'Updates must be an array') return res.status(400).json({ message: err.message });
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getRoleById,
  getUsersByRoleType,
  getRoleStatistics,
  bulkUpdateUserRoles
};
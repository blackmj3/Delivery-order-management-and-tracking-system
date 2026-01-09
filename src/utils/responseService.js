const success = (data = null, message = 'Success', status = 200) => {
  return { success: true, message, data, status };
};

const error = (message = 'Error', status = 400, errors = null) => {
  return { success: false, message, errors, status };
};

module.exports = { success, error };

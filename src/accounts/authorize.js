import bcrypt from 'bcryptjs';
const { compare } = bcrypt;

export async function authorizeUser(email, password) {
  // Import user collection
  const { user } = await import('../user/user.js');
  // Look up user
  const userData = await user.findOne({ 'email.address': email });
  console.log(userData);
  // Get user password
  const savedPassword = userData.password;
  // compare password with one in database
  const isAuthorized = await compare(password, savedPassword);
  console.log('isAuthorized', isAuthorized);
  // Return boolean of is password is correct
  return isAuthorized;
}

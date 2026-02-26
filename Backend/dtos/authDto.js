const { z } = require('zod');

const registerDto = z.object({
    username: z.string().min(3).max(50),
    email: z.string().email(),
    password: z.string().min(6),
    roleName: z.string().optional()
});

const loginDto = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

module.exports = {
    registerDto,
    loginDto,
};



export const FLAGS = {
    USER: 0,
    ADMIN: 2,
    SUPER: 1,
};

export const checkFlag = (flags, checkEsportalAdmin = false) => {
    return async (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ error: "Not logged in" });
        }

        const currentUser = req.session.user;
        const hasCorrectFlag = flags.includes(currentUser.flag);

        if (hasCorrectFlag || (checkEsportalAdmin && currentUser.role_type === 0)) {
            return next();
        }

        return res.status(401).json({ error: "No permissions for this action" });
    };
};


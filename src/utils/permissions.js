// utils/permissions.js

/**
 * ইউজারের নির্দিষ্ট কোনো পারমিশন আছে কিনা তা চেক করে।
 */
export const hasAccess = (userPermissions, requiredPermission) => {
    if (!userPermissions || !Array.isArray(userPermissions)) {
        return false;
    }
    // .trim() যোগ করা হয়েছে যাতে ভুলে স্পেস থাকলেও সমস্যা না হয়
    return userPermissions.some(p => String(p).trim() === String(requiredPermission).trim());
};

/**
 * ইউজার নির্দিষ্ট কোনো গ্রুপে (Role) আছে কিনা তা চেক করে।
 */
export const isInGroup = (groups, targetGroup) => {
    if (!groups || !Array.isArray(groups)) return false;

    return groups.some(group => {
        // গ্রুপের নাম বের করা (স্ট্রিং বা অবজেক্ট যাই হোক)
        const groupName = typeof group === 'string' ? group : group.name;
        
        if (!groupName) return false;

        // Case-insensitive চেক করা ভালো (যেমন: 'Admin' এবং 'admin' একই ধরবে)
        return groupName.toLowerCase().trim() === targetGroup.toLowerCase().trim();
    });
};

/**
 * মাল্টিপল পারমিশন চেক করার জন্য।
 * যদি ইউজারের লিস্টের যেকোনো একটি পারমিশন থাকে তবেই true রিটার্ন করবে।
 */
export const hasAnyAccess = (userPermissions, requiredPermissionsArray) => {
    if (!userPermissions || !Array.isArray(userPermissions) || !Array.isArray(requiredPermissionsArray)) {
        return false;
    }
    return requiredPermissionsArray.some(permission => hasAccess(userPermissions, permission));
};
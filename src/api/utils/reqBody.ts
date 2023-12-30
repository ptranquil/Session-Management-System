export const sessionPostRequestBody = new Set([
    "type",
    "date",
    "timeSlot",
    "patientId",
    "therapistId",
    "details",
    "onlineSessionLink"
]);

export const patientPostRequestbody = new Set([
    "name",
    "mobile",
    "whatsApp",
    "isContactSame",
    "email",
    "address"
]);

export const therapistPostRequestbody = new Set([
    "name",
    "mobile",
    "email"
]);
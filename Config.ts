import dotenv from 'dotenv';
dotenv.config();
export class Config{
    static get getReplyWeightage() {
        return parseFloat(process.env.replyWeightage || '0.3');
    }
    static get getEditTimeWindow() {
        return parseInt(process.env.editTimeWindowInMins || '5');
    }
}
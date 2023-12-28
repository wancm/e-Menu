import { ObjectId } from 'mongodb'

export class GeneralConverter {
    static toDto<T>(mongodbObj: any): T | undefined {
        if (!mongodbObj) return undefined
        const val = {
            ...mongodbObj,
        }

        /**
         * In Next.js, if we are passing an object with a mongodb ObjectId property to a client component
         * from a server component will cause Next.js throw error below.
         *
         * Only plain objects can be passed to Client Components from Server Components.
         * Objects with toJSON methods are not supported. Convert it manually to a simple value before passing it to props.
         *
         * Therefore, convert the _id to a normal text field
         * https://www.youtube.com/watch?v=_KfwY6EAYJM
         * */
        if (val._id) val._id = (val._id as ObjectId).toHexString()

        return val as T
    }
}

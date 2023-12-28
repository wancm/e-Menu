import { bootstrapApplication } from '@angular/platform-browser'
import { AppComponent } from './app/app.component'
import { config } from './app/app.config.server'
import dotenv from 'dotenv'

dotenv.config()

const bootstrap = () => bootstrapApplication(AppComponent, config)

export default bootstrap

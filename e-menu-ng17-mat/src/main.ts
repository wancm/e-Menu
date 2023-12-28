import { bootstrapApplication } from '@angular/platform-browser'
import { AppSettings } from '@libs/app-settings'
import { AppComponent } from './app/app.component'
import { appConfig } from './app/app.config'

const startup = async () => {
    await AppSettings.startup()
}

startup().then(() => {
    bootstrapApplication(AppComponent, appConfig) //
        .catch((err) => console.error(err))
})

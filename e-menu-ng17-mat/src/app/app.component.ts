import { Component } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterOutlet } from '@angular/router'
import { getLocalData } from '@libs/shared/types/services/app-http-client'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    title = 'e-menu-ng17-mat'

    data: any

    constructor() {
        getLocalData<any>("/info").then((data) => {
            this.data = data
        })
    }
}

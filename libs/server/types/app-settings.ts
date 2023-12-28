export type AppSettings = {
    identifier: string
    app: string
    appInsights: {
        instrumentationKey: string
    }
    countriesSettings: AppCountrySetting[]
}

export type AppCountrySetting = {
    countryCode: string
    defaultLanguage: string
}

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.4.4](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.4.3...medusa-plugin-auth@1.4.4) (2023-05-03)

**Note:** Version bump only for package medusa-plugin-auth





## [1.4.3](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.4.2...medusa-plugin-auth@1.4.3) (2023-03-03)


### Bug Fixes

* google auth route builder ([#60](https://github.com/adrien2p/medusa-plugins/issues/60)) ([f0d678a](https://github.com/adrien2p/medusa-plugins/commit/f0d678aaa1e3e605513943c7fa24cb9f1eb57770))





## [1.4.2](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.4.0...medusa-plugin-auth@1.4.2) (2023-02-17)

**Note:** Version bump only for package medusa-plugin-auth





# [1.4.0](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.3.1...medusa-plugin-auth@1.4.0) (2023-02-17)


### Features

* Add support for dynamic success redirect url through a query param ([1d16fc1](https://github.com/adrien2p/medusa-plugins/commit/1d16fc113ea4b3a842b86be9d78fde42b85a8c8d))





## [1.3.1](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.3.0...medusa-plugin-auth@1.3.1) (2023-01-27)


### Bug Fixes

* apply expiresIn from the auth provider config ([76d37d4](https://github.com/adrien2p/medusa-plugins/commit/76d37d4bc729524da43748c33f788199dbe8a0b6))





# [1.3.0](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.2.3...medusa-plugin-auth@1.3.0) (2023-01-27)


### Bug Fixes

* Auth route builder ([#44](https://github.com/adrien2p/medusa-plugins/issues/44)) ([b5f6d7a](https://github.com/adrien2p/medusa-plugins/commit/b5f6d7ad5f2d3e6a1a2e3f0e802bf8b5c761129c))


### Features

* Allow to access session from the plugin and remove cookie usage ([#32](https://github.com/adrien2p/medusa-plugins/issues/32)) ([d97a96f](https://github.com/adrien2p/medusa-plugins/commit/d97a96fe1c4fd473d26acc462b9ecefce498b32c))
* **Auth0:** Add Auth0 Authentication ([#27](https://github.com/adrien2p/medusa-plugins/issues/27)) ([06c0c20](https://github.com/adrien2p/medusa-plugins/commit/06c0c205615a826cc601fb54f994a2a1d48ba45d))





## [1.2.3](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.2.2...medusa-plugin-auth@1.2.3) (2022-12-05)


### Bug Fixes

* build callback handler token gegeneration ([#31](https://github.com/adrien2p/medusa-plugins/issues/31)) ([69313db](https://github.com/adrien2p/medusa-plugins/commit/69313db72916c9681214aef27176ee00aec5eb05))





## [1.2.2](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.2.1...medusa-plugin-auth@1.2.2) (2022-12-02)


### Bug Fixes

* jwt store token property ([775df46](https://github.com/adrien2p/medusa-plugins/commit/775df469b04316a4f5a8500051af5ce34e20de50))





## [1.2.1](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.2.0...medusa-plugin-auth@1.2.1) (2022-11-29)


### Bug Fixes

* npm files ([ab44413](https://github.com/adrien2p/medusa-plugins/commit/ab44413b9a7b18f04dcb6354d1e6d96fad2b4561))





# [1.2.0](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.0.2...medusa-plugin-auth@1.2.0) (2022-11-29)


### Bug Fixes

* Wrong user property used in store auth strategies ([73812dc](https://github.com/adrien2p/medusa-plugins/commit/73812dc795a105053e3735d6c0f21a1aa925ef9a))


### Features

* update strategies according to the latest auth changes from medusa core ([#26](https://github.com/adrien2p/medusa-plugins/issues/26)) ([9afc2fd](https://github.com/adrien2p/medusa-plugins/commit/9afc2fd43df96567e511087bd4a725e7e711e54a))





# [1.1.0](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.0.2...medusa-plugin-auth@1.1.0) (2022-11-26)


### Features

* update strategies according to the latest auth changes from medusa core ([#26](https://github.com/adrien2p/medusa-plugins/issues/26)) ([9afc2fd](https://github.com/adrien2p/medusa-plugins/commit/9afc2fd43df96567e511087bd4a725e7e711e54a))





## [1.0.2](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@1.0.1...medusa-plugin-auth@1.0.2) (2022-11-22)


### Bug Fixes

* authentication strategy cookies and split cookies per domain ([80363de](https://github.com/adrien2p/medusa-plugins/commit/80363de8a9d91a5a96495513a9fd3bf1f22dc8a4))
* update logout handler accordingly to the previous changes ([4f01f31](https://github.com/adrien2p/medusa-plugins/commit/4f01f31f04da12b6169816175d2ab221fc6fb53f))





## [1.0.1](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@0.3.0...medusa-plugin-auth@1.0.1) (2022-11-20)


### Bug Fixes

* auth store strategies ([#24](https://github.com/adrien2p/medusa-plugins/issues/24)) ([60a03e6](https://github.com/adrien2p/medusa-plugins/commit/60a03e6625b29bb0ce4b298b6f7e2af798741da0))
* missing update of jwt strategy ([ec8aecf](https://github.com/adrien2p/medusa-plugins/commit/ec8aecfe63024236674049563518f4b4365680d2))





# [0.3.0](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@0.1.0...medusa-plugin-auth@0.3.0) (2022-11-09)


### Features

* add Linkedin Oauth 2 support ([acc036b](https://github.com/adrien2p/medusa-plugins/commit/acc036b842d93b2bb6a2bf9dd6cd8d39fc7502ad))
* Add twitter OAuth 2 pre-support ([1395689](https://github.com/adrien2p/medusa-plugins/commit/1395689197f1b5b7258e961b52c46c3a16bf1de8))
* supposrt facebook authentication strategy ([#19](https://github.com/adrien2p/medusa-plugins/issues/19)) ([1dc7582](https://github.com/adrien2p/medusa-plugins/commit/1dc75826bcae6072d00078d503956166f3713634))





# [0.2.0](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@0.1.0...medusa-plugin-auth@0.2.0) (2022-11-08)


### Features

* supposrt facebook authentication strategy ([f206645](https://github.com/adrien2p/medusa-plugins/commit/f206645011d82ec73268c89485dfeb07d6ec55bb))





# [0.1.0](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@0.0.3...medusa-plugin-auth@0.1.0) (2022-11-07)


### Features

* Allow to pass a custom verify callback for google strategy ([#18](https://github.com/adrien2p/medusa-plugins/issues/18)) ([7b0f824](https://github.com/adrien2p/medusa-plugins/commit/7b0f8244578decdc82dba16bd728f6610f1fc606))





## [0.0.3](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@0.0.2...medusa-plugin-auth@0.0.3) (2022-11-04)


### Bug Fixes

* logout ([c23027d](https://github.com/adrien2p/medusa-plugins/commit/c23027d6e0051a28119835764eff24c47438fe08))





## [0.0.2](https://github.com/adrien2p/medusa-plugins/compare/medusa-plugin-auth@0.0.1...medusa-plugin-auth@0.0.2) (2022-11-04)


### Bug Fixes

* logout ([a6c6a08](https://github.com/adrien2p/medusa-plugins/commit/a6c6a08cc6411e30f29cbf5685075e732ed80c27))





## 0.0.1 (2022-11-04)


### Bug Fixes

* add support for logout ([7bbefe7](https://github.com/adrien2p/medusa-plugins/commit/7bbefe7a6982c3346b941308e7bf82c4bbdb5180))

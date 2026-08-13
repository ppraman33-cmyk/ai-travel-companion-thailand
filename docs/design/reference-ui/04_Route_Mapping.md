# Reference Route Mapping

| Screens                           | Route contract                                                             |
| --------------------------------- | -------------------------------------------------------------------------- |
| 01                                | `/`                                                                        |
| 02                                | `/explore`                                                                 |
| 03, 16, 25, 30                    | `/assistant`                                                               |
| 04, 18, 24, 29, 32                | `/saved` and presentation states supported by existing ownership contracts |
| 05, 19, 29, 35                    | `/profile`                                                                 |
| 06                                | `/thailand`                                                                |
| 07                                | `/thailand/regions`                                                        |
| 08                                | `/thailand/provinces`                                                      |
| 09                                | `/thailand/[region]/[province]/attractions`                                |
| 10, 12, 14, 15, 24, 27, 28, 32–34 | `/thailand/[region]/[province]/[category]/[slug]`                          |
| 11, 26, 33                        | `/food` and restaurant catalog context                                     |
| 13, 27, 34                        | `/events`                                                                  |
| 17, 25, 31                        | `/trips` and `/trips/[id]` when existing contracts suffice                 |
| 20                                | `/settings`                                                                |
| 21, 22                            | `/help` and `/help/[article]`                                              |
| 21, 35                            | `/about`                                                                   |
| 23                                | `/notifications`, `/privacy`                                               |

The route structure is visual and presentation-oriented. It does not authorize new database, API, session or publication contracts. Unsupported state is disabled/read-only and explicitly described.

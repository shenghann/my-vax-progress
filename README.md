# MY Vax Tracker - Malaysia Vaccination Progress Dashboard

This is the source code for [MY Vax Tracker](https://vax.tehcpeng.net/) - a live dashboard built to track the progress of Malaysia impressive COVID-19 vaccination program and providing a simple extrapolation of how soon can we reach vaccination of 80% of adult population based on average vaccination rates. The dashboard is built on top of open data from [CITF](https://github.com/CITF-Malaysia/citf-public).

:warning: **Note**: As of 17th June 2022, daily updates to the dashboard has ceased.

## Tech Stack

- Next.js (React)
- Tailwind CSS
- Vercel SSG
- Python/pandas loader

## Running the Frontend
Simply:
```bash
npm install
npm run dev
```
## Running the Loader
### Setup python environment
Tested with Python 3.9.6
```bash
<your python exe> -m venv env

# activate and install dependencies
source env/bin/activate
pip install -r req.txt
```
### How `load.sh` works
This shell script checks the CTIF Github repo for new commits and pulls new data, and rebuilds `data.json` - all data required for charts and elements on the frontend. Then, pushes the updated data payload to the repo.

Vercel Git integration seamlessly launches automatic deployments triggered by each Git push.

## The Story
This was a weekend project by a data scientist armed with coffee and a drive to contribute to the fight against the pandemic - and a desire to use data storytelling to paint a path of hope and light at the end of the tunnel. The dashboard went viral and eventually saw 1 million visits.

Huge kudos to CITF for releasing daily-updated granular vaccination datasets!

:tada: As featured on [The Star](https://www.thestar.com.my/news/nation/2021/08/15/tech-savvy-guys-step-up) (15th Aug 2021)
## License

This project is published under an MIT License.


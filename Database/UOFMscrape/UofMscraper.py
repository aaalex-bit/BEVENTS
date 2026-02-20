
import requests
from bs4 import BeautifulSoup

#function to scrape the website 
def get_UMSU_events():
        
    url = "https://umsu.ca/events/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    events_results = []
    articles = soup.find_all('article')

    for art in articles:
        try:
            # Get the title and the details link
            link_tag = art.find('a', class_='tribe-events-pro-photo__event-title-link')
            title = link_tag.get_text(strip=True)
            detail_url = link_tag['href']
            
            # get the image url 
            img_tag = art.find('img', class_='tribe-events-pro-photo__event-featured-image')
            image_url = img_tag['src'] if img_tag else "default.jpg" # if no image get the default.jpg

            # get the date  
            date_element = art.find('time', class_='tribe-events-pro-photo__event-date-tag-datetime')
            date = date_element['datetime'] if date_element else "N/A"

            time_container = art.find('div', class_='tribe-events-pro-photo__event-datetime')
        
            start_time = "N/A"
            end_time = "N/A"
        
            if time_container:
                actual_times = time_container.find_all('time')
                # The first <time> is the start, the second is the end
                if len(actual_times) >= 1:
                    start_time = actual_times[0].get_text(strip=True)
                if len(actual_times) >= 2:
                    end_time = actual_times[1].get_text(strip=True)

            # Append to results
            events_results.append({
                "title": title,
                "image": image_url,
                "link": detail_url,
                "date": date,       # eg. FEB 23
                "start_time": start_time, # eg, 8:00 pm
                "end_time": end_time      # eg. 11:00 pm
            })
            
        except Exception as e:
            print(f"Error parsing event: {e}")
            continue

    return events_results


#Test 
#print(get_UMSU_events())
import cv2
import pytesseract
from PIL import Image;
import requests
from matplotlib import pyplot as plt
from playwright.sync_api import sync_playwright


#this handles the version 
class InstaScraper:
    
    information = {
            
    }
    
    
    locators= {
        "link" : "",
        "image" : ""
    }
    
    
    def __init__(self, link_to_webPage ):
        self.link_to_webPage = link_to_webPage
       
    
    
    def getInfo(self):
        value ={
            "Image" : "",
            "Date" : "",
            
        }
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True) 
            page = browser.new_page()
            page.goto(self.link_to_webPage, timeout=10000)
            image = page.locator('.x5yr21d',  timeout=1000)
            for i  in image.count():
                print(i.get_attribute("src"))
            
            browser.close()
        
    

    def ImageAnalysis(ImageUrl : str)-> str:
        img = cv2.imread(Image.open(requests.get(ImageUrl, stream=True).raw))
        
        


A = InstaScraper("https://www.instagram.com/umsu_cares/").getInfo()
    